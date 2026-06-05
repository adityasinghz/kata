import OpenAI from 'openai';
import { addAuditLog, updateCostRecord } from './interview-store';

// Initialize OpenAI
const apiKey = process.env.OPENAI_API_KEY;
let openai;
if (apiKey) {
  openai = new OpenAI({ apiKey });
}

function checkConfig() {
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not set in the environment variables. Please add it to your .env.local file.');
  }
}

// Rough token estimation (1 token ≈ 4 chars) as fallback
function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

// === Question Generator Agent ===
export async function generateQuestions(config) {
  checkConfig();
  const { role, level, skills, jdText, resumeText } = config;
  
  const systemInstruction = `You are an expert technical interviewer acting as a Question Generator Agent. 
Your goal is to generate an interview question bank for a candidate applying for the ${level} ${role} position.
Required Skills: ${skills.join(', ')}

Guidelines:
1. Generate between 10 and 15 questions.
2. Questions must span these categories: TECHNICAL, BEHAVIORAL, PROBLEM_SOLVING, SYSTEM_DESIGN.
3. For ${level} roles, adjust the depthTarget appropriately (FOUNDATIONAL, APPLIED, DEEP).
4. If Job Description (JD) or Resume is provided, tailor questions to them.`;

  const userPrompt = `
Generate the interview question bank.
Job Description: ${jdText || 'None provided'}
Candidate Resume: ${resumeText || 'None provided'}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "question_bank",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "e.g. Q-001" },
                    category: { type: "string", enum: ["TECHNICAL", "BEHAVIORAL", "PROBLEM_SOLVING", "SYSTEM_DESIGN"] },
                    text: { type: "string", description: "The full question text" },
                    sequence: { type: "integer", description: "Display order (1-based)" },
                    source: { type: "string", enum: ["JD_ALIGNED", "RESUME_PROBE", "GENERAL"] },
                    depthTarget: { type: "string", enum: ["FOUNDATIONAL", "APPLIED", "DEEP"] },
                    skillTags: { type: "array", items: { type: "string" } }
                  },
                  required: ["id", "category", "text", "sequence", "source", "depthTarget", "skillTags"],
                  additionalProperties: false
                }
              }
            },
            required: ["questions"],
            additionalProperties: false
          }
        }
      }
    });

    const responseText = response.choices[0].message.content;
    const responseData = JSON.parse(responseText);
    
    // Add isActive flag
    const questions = responseData.questions.map(q => ({ ...q, isActive: true }));
    
    return {
      questions,
      tokenUsage: {
        inputTokens: response.usage?.prompt_tokens || estimateTokens(systemInstruction + userPrompt),
        outputTokens: response.usage?.completion_tokens || estimateTokens(responseText)
      },
      promptText: systemInstruction + '\n\n' + userPrompt,
      responseText
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate questions: " + error.message);
  }
}

// === Adaptive Follow-up & Evaluator Agent ===
export async function evaluateAndAdapt(question, response, interviewContext) {
  checkConfig();
  const { coverage, questionsAsked, totalExpected } = interviewContext;
  
  const systemInstruction = `You are an expert technical interviewer acting as a Response Evaluator and Adaptive Follow-up Agent.
Evaluate the candidate's response to the given question and decide the next action.

Evaluate on 4 dimensions (score 0 to 10):
- technicalDepth
- communication
- problemSolving
- roleAlignment

Also provide an overall depthScore (1 to 5) indicating the depth of the candidate's response.
Based on the depthScore, coverage map, and questions asked (${questionsAsked}/${totalExpected}), determine the next action:
- FOLLOW_UP_EASIER (if depth <= 2)
- FOLLOW_UP_DEEPER (if depth >= 4)
- NEW_TOPIC (if depth == 3)
- CONCLUDE (if questions >= totalExpected or all topics covered sufficiently)

If not CONCLUDE, provide a natural transitionText and the nextQuestionText. If CONCLUDE, nextQuestionText should be empty string.`;

  const userPrompt = `
Current Question [${question.category}]: "${question.text}"
Candidate Response: "${response}"
Coverage Map: ${JSON.stringify(coverage)}
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "evaluation_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            depthScore: { type: "integer", description: "1 to 5" },
            dimensions: {
              type: "object",
              properties: {
                technicalDepth: { type: "object", properties: { score: { type: "number" }, rationale: { type: "string" } }, required: ["score", "rationale"], additionalProperties: false },
                communication: { type: "object", properties: { score: { type: "number" }, rationale: { type: "string" } }, required: ["score", "rationale"], additionalProperties: false },
                problemSolving: { type: "object", properties: { score: { type: "number" }, rationale: { type: "string" } }, required: ["score", "rationale"], additionalProperties: false },
                roleAlignment: { type: "object", properties: { score: { type: "number" }, rationale: { type: "string" } }, required: ["score", "rationale"], additionalProperties: false }
              },
              required: ["technicalDepth", "communication", "problemSolving", "roleAlignment"],
              additionalProperties: false
            },
            action: { type: "string", enum: ["FOLLOW_UP_EASIER", "FOLLOW_UP_DEEPER", "NEW_TOPIC", "CONCLUDE"] },
            reasoning: { type: "string", description: "Brief explanation of the action choice" },
            transitionText: { type: "string", description: "Natural conversational transition" },
            nextQuestionText: { type: "string", description: "The text for the follow up or new question." }
          },
          required: ["depthScore", "dimensions", "action", "reasoning", "transitionText", "nextQuestionText"],
          additionalProperties: false
        }
      }
    }
  });

  const responseText = result.choices[0].message.content;
  const parsed = JSON.parse(responseText);
  
  return {
    ...parsed,
    tokenUsage: {
      inputTokens: result.usage?.prompt_tokens || estimateTokens(systemInstruction + userPrompt),
      outputTokens: result.usage?.completion_tokens || estimateTokens(responseText)
    },
    promptText: systemInstruction + '\n\n' + userPrompt,
    responseText
  };
}

// === Feedback Synthesizer Agent ===
export async function synthesizeFeedback(interview) {
  checkConfig();
  const responses = interview.responses || [];
  
  const systemInstruction = `You are an expert technical interviewer acting as a Feedback Synthesizer Agent.
Review the complete interview Q&A and dimension scores, and synthesize a final structured feedback report.`;

  const qnaText = responses.map((r, i) => `
Q${i+1}: ${interview.questions.find(q => q.id === r.questionId)?.text}
A${i+1}: ${r.candidateText}
Scores: Tech=${r.dimensions?.technicalDepth?.score}, Comm=${r.dimensions?.communication?.score}, PS=${r.dimensions?.problemSolving?.score}, Align=${r.dimensions?.roleAlignment?.score}
  `).join('\n');

  const userPrompt = `
Role: ${interview.role}
Candidate: ${interview.candidateName}

Q&A Transcript and Scores:
${qnaText}

Calculate average scores, overall confidence (0-100%), and AI recommendation (STRONG_HIRE, HIRE, MAYBE, NO_HIRE).
Extract key strengths, concerns, and notable quotes.
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "feedback_report",
        strict: true,
        schema: {
          type: "object",
          properties: {
            technicalDepth: { type: "number" },
            communication: { type: "number" },
            problemSolving: { type: "number" },
            roleAlignment: { type: "number" },
            overallConfidence: { type: "integer", description: "0-100" },
            aiRecommendation: { type: "string", enum: ["STRONG_HIRE", "HIRE", "MAYBE", "NO_HIRE"] },
            feedbackSummary: {
              type: "object",
              properties: {
                overallImpression: { type: "string" },
                strengths: {
                  type: "array",
                  items: { type: "object", properties: { area: { type: "string" }, evidence: { type: "string" } }, required: ["area", "evidence"], additionalProperties: false }
                },
                concerns: {
                  type: "array",
                  items: { type: "object", properties: { area: { type: "string" }, evidence: { type: "string" } }, required: ["area", "evidence"], additionalProperties: false }
                },
                notableQuotes: { type: "array", items: { type: "string" } },
                recommendationRationale: { type: "string" }
              },
              required: ["overallImpression", "strengths", "concerns", "notableQuotes", "recommendationRationale"],
              additionalProperties: false
            }
          },
          required: ["technicalDepth", "communication", "problemSolving", "roleAlignment", "overallConfidence", "aiRecommendation", "feedbackSummary"],
          additionalProperties: false
        }
      }
    }
  });
  
  const responseText = result.choices[0].message.content;
  const parsed = JSON.parse(responseText);
  
  return {
    scores: parsed,
    tokenUsage: {
      inputTokens: result.usage?.prompt_tokens || estimateTokens(systemInstruction + userPrompt),
      outputTokens: result.usage?.completion_tokens || estimateTokens(responseText)
    },
    promptText: systemInstruction + '\n\n' + userPrompt,
    responseText
  };
}

// === Orchestrator Wrapper ===
export async function orchestrate(interviewId, agentName, operation, agentFn) {
  const startTime = Date.now();
  const result = await agentFn();
  const latencyMs = Date.now() - startTime;

  const { tokenUsage, promptText, responseText } = result;

  // Track cost
  let callCostUsd = 0;
  if (tokenUsage) {
    // OpenAI gpt-4o-mini pricing: $0.150 / 1M input, $0.600 / 1M output
    callCostUsd = ((tokenUsage.inputTokens * 0.150) + (tokenUsage.outputTokens * 0.600)) / 1000000;
  }

  // Log to audit trail
  addAuditLog({
    interviewId,
    agentName,
    operation,
    promptText: promptText || `[${agentName}] ${operation}`,
    responseText: responseText || '[Response logged]',
    inputTokens: tokenUsage?.inputTokens || 0,
    outputTokens: tokenUsage?.outputTokens || 0,
    costUsd: callCostUsd,
    latencyMs,
    modelUsed: 'gpt-4o-mini'
  });

  if (interviewId && tokenUsage) {
    updateCostRecord(interviewId, agentName, tokenUsage.inputTokens, tokenUsage.outputTokens);
  }

  return result;
}
