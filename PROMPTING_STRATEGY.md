# Prompting Strategy — AI-Assisted Interview Screening

> This document details the prompt intent, technique, context, and expected output for each AI agent in the system.

---

## 1. Agent Overview

| # | Agent | Purpose | Technique | Trigger |
|---|-------|---------|-----------|---------|
| 1 | Question Generator | Create role-specific interview questions | Few-Shot + Structured Output | Interview setup |
| 2 | Adaptive Follow-up | Decide next question based on response depth | Chain-of-Thought (CoT) | After each response |
| 3 | Response Evaluator | Score candidate response on rubric | Rubric-Grounded + CoT | After each response |
| 4 | Feedback Synthesizer | Generate interview summary narrative | Structured Summarization | Interview completion |
| 5 | Integrity Monitor | Flag suspicious response patterns | Rule-Based + Pattern Match | Post-interview analysis |

---

## 2. Agent Prompt Specifications

### 2.1 Question Generator Agent

**Intent:** Generate a comprehensive, role-tailored set of interview questions that cover all required competency areas, calibrated to the candidate's seniority level.

**Technique:** Few-Shot Prompting + Structured JSON Output

**Context Window:**
```
System Prompt (fixed) + Role Definition + Skills List + JD Text + Resume Summary (optional) + Few-Shot Examples
```

**Prompt Template:**
```
You are an expert technical interviewer. Generate interview questions for the following position.

## Role Configuration
- **Position:** {role}
- **Seniority Level:** {level}
- **Required Skills:** {skills_list}
- **Job Description:** {jd_summary}
- **Resume Highlights:** {resume_highlights}

## Instructions
1. Generate exactly {count} questions.
2. Categorize each question into one of: TECHNICAL, BEHAVIORAL, PROBLEM_SOLVING, SYSTEM_DESIGN.
3. Calibrate difficulty to the seniority level:
   - Junior: Foundational concepts, basic implementation
   - Mid: Applied knowledge, trade-offs, real scenarios
   - Senior: Architecture decisions, system design, leadership
4. If resume highlights are provided, include 2-3 questions that probe specific experiences mentioned.
5. If gaps exist between resume and JD, include 1-2 questions exploring those areas.

## Output Format (JSON)
[
  {
    "id": "Q1",
    "category": "TECHNICAL",
    "text": "Question text here",
    "depth_target": "FOUNDATIONAL | APPLIED | DEEP",
    "skill_tags": ["java", "spring-boot"],
    "source": "JD_ALIGNED | RESUME_PROBE | GAP_EXPLORATION | GENERAL"
  }
]

## Few-Shot Examples

### Example 1: Senior Backend Engineer (Java)
Input: Role=Senior Backend Engineer, Skills=[Java, Spring Boot, Microservices, Kafka]
Output:
[
  {
    "id": "Q1",
    "category": "SYSTEM_DESIGN",
    "text": "You need to design an event-driven order processing system. Walk me through how you would decompose this into microservices, what communication patterns you would use, and how you would handle eventual consistency.",
    "depth_target": "DEEP",
    "skill_tags": ["microservices", "kafka", "system-design"],
    "source": "JD_ALIGNED"
  },
  {
    "id": "Q2",
    "category": "TECHNICAL",
    "text": "Explain the difference between @Transactional propagation levels in Spring. When would you use REQUIRES_NEW vs REQUIRED?",
    "depth_target": "APPLIED",
    "skill_tags": ["spring-boot", "java"],
    "source": "GENERAL"
  }
]
```

**Expected Output:** JSON array of 10-15 question objects with categories, depth targets, and skill tags.

**Token Budget:** ~1,200 tokens (input: ~800, output: ~400)

**Cost (Gemini 2.0 Flash):** ~$0.0002

---

### 2.2 Adaptive Follow-up Agent

**Intent:** Decide the next interview action based on the candidate's response depth and overall topic coverage, generating either a follow-up question, a new topic question, or a conclusion signal.

**Technique:** Chain-of-Thought (CoT) Reasoning

**Context Window:**
```
System Prompt + Current Question + Candidate Response + Depth Score + Coverage Map + Conversation History (last 3 turns)
```

**Prompt Template:**
```
You are an adaptive interview engine. Based on the candidate's response, decide the next interview action.

## Current State
- **Question Asked:** {current_question}
- **Candidate Response:** {candidate_response}
- **Response Depth Score:** {depth_score}/5
- **Questions Asked So Far:** {questions_count}/12
- **Topic Coverage:**
  - Technical: {tech_coverage}%
  - Behavioral: {behav_coverage}%
  - Problem Solving: {ps_coverage}%
  - System Design: {sd_coverage}%

## Recent Conversation (last 3 turns)
{conversation_history}

## Decision Rules
1. If depth_score <= 2: Generate a SIMPLER follow-up to help the candidate demonstrate basic understanding
2. If depth_score == 3: Move to a NEW TOPIC (pick the least covered category)
3. If depth_score >= 4: Generate a DEEPER follow-up to explore advanced understanding
4. If all categories >= 60% coverage AND questions >= 8: CONCLUDE the interview
5. Never ask the same question twice
6. Transition naturally between questions (acknowledge the previous answer briefly)

## Think step-by-step:
1. Assess the candidate's response quality
2. Check which topic areas still need coverage
3. Decide: FOLLOW_UP_EASIER | FOLLOW_UP_DEEPER | NEW_TOPIC | CONCLUDE
4. Generate the next question with a natural transition

## Output Format (JSON)
{
  "action": "FOLLOW_UP_DEEPER",
  "reasoning": "Candidate showed strong understanding of microservices decomposition but didn't address data consistency. Probing deeper.",
  "transition_text": "Great explanation of service boundaries. I'd like to dig deeper on one aspect —",
  "next_question": {
    "text": "How would you handle distributed transactions across these microservices? What patterns would you consider?",
    "category": "SYSTEM_DESIGN",
    "depth_target": "DEEP"
  }
}
```

**Expected Output:** JSON with action type, reasoning, transition text, and next question.

**Token Budget:** ~800 tokens (input: ~600, output: ~200)

**Cost:** ~$0.0001

---

### 2.3 Response Evaluator Agent

**Intent:** Score a candidate's response on a structured rubric with per-dimension scores and reasoning for each score.

**Technique:** Rubric-Grounded Evaluation + Chain-of-Thought

**Context Window:**
```
System Prompt + Question + Expected Good Answer Indicators + Candidate Response + Rubric Definition
```

**Prompt Template:**
```
You are an expert interview evaluator. Score the candidate's response using the rubric below.

## Question
{question_text}
Category: {question_category}
Target Depth: {depth_target}

## Candidate Response
{candidate_response}

## Scoring Rubric (0-10 scale)
| Dimension | 0-3 (Weak) | 4-6 (Adequate) | 7-8 (Strong) | 9-10 (Exceptional) |
|-----------|-----------|----------------|--------------|-------------------|
| Technical Depth | Incorrect or missing concepts | Basic understanding, some gaps | Solid understanding with examples | Expert-level, nuanced, edge cases covered |
| Communication | Unclear, rambling | Understandable but unstructured | Clear and structured | Articulate, concise, excellent structure |
| Problem Solving | No approach shown | Basic approach, no alternatives | Structured approach with trade-offs | Innovative, multiple approaches evaluated |
| Role Alignment | No relevance to role | Some relevance | Good fit indicators | Strong fit with specific evidence |

## Instructions
1. Think through each dimension carefully
2. Provide a specific score (0-10) with brief justification
3. Calculate an overall depth score (1-5) representing response quality
4. Be calibrated: most adequate responses should score 4-6, not 7-10

## Output Format (JSON)
{
  "depth_score": 4,
  "dimensions": {
    "technical_depth": { "score": 7, "rationale": "Correctly explained CQRS with practical example..." },
    "communication": { "score": 6, "rationale": "Clear but could be more structured..." },
    "problem_solving": { "score": 5, "rationale": "Mentioned one approach but didn't discuss alternatives..." },
    "role_alignment": { "score": 8, "rationale": "Strong fit — experience directly maps to role requirements..." }
  },
  "key_observations": ["Strong on distributed systems", "Needs work on communication structure"]
}
```

**Expected Output:** JSON with depth score, dimension scores with rationale, and key observations.

**Token Budget:** ~600 tokens (input: ~400, output: ~200)

**Cost:** ~$0.0001

---

### 2.4 Feedback Synthesizer Agent

**Intent:** Generate a human-readable narrative summary of the entire interview, highlighting strengths, concerns, and a clear recommendation rationale.

**Technique:** Structured Summarization + Narrative Generation

**Context Window:**
```
System Prompt + All Q&A Pairs + All Dimension Scores + Role Context + Score Summary
```

**Prompt Template:**
```
You are a senior hiring advisor. Synthesize the interview results into a structured feedback report.

## Interview Context
- **Role:** {role} ({level})
- **Required Skills:** {skills}
- **Questions Asked:** {question_count}
- **Topics Covered:** {coverage_summary}

## Complete Q&A with Scores
{all_qa_with_scores}

## Aggregate Scores
- Technical Depth: {avg_technical}/10
- Communication: {avg_communication}/10
- Problem Solving: {avg_problem_solving}/10
- Role Alignment: {avg_role_alignment}/10
- Overall: {overall_confidence}/100

## Instructions
1. Write a professional, balanced assessment (3-4 paragraphs)
2. Lead with overall impression
3. List top 3 strengths with specific evidence from responses
4. List top 3 areas of concern with specific evidence
5. Include 1-2 notable quotes from the candidate
6. End with clear recommendation rationale
7. Keep tone professional and actionable

## Output Format (JSON)
{
  "overall_impression": "...",
  "strengths": [
    { "area": "System Design", "evidence": "In Q3, candidate demonstrated..." }
  ],
  "concerns": [
    { "area": "Communication", "evidence": "Responses tended to be..." }
  ],
  "notable_quotes": ["..."],
  "recommendation_rationale": "Based on the overall assessment...",
  "recommendation": "HIRE"
}
```

**Expected Output:** JSON with structured feedback sections.

**Token Budget:** ~1,000 tokens (input: ~700, output: ~300)

**Cost:** ~$0.0002

---

### 2.5 Integrity Monitor Agent

**Intent:** Flag suspicious patterns in candidate responses that may indicate dishonesty, copy-pasting, or AI-assisted answering.

**Technique:** Rule-Based Pattern Matching + Statistical Analysis

**Context Window:**
```
All responses + Timing data + Vocabulary analysis
```

**Flags Monitored:**
| Flag | Detection Method | Threshold |
|------|-----------------|-----------|
| **Unusually Fast Response** | Response time < 10s for complex question | Time per question < 15% of average |
| **Vocabulary Inconsistency** | Sudden shift in technical vocabulary depth | Flesch-Kincaid grade level variance > 4 |
| **Copy-Paste Pattern** | Response length/complexity spike on specific questions | Word count > 3x average |
| **Repetitive Structure** | Identical phrasing patterns across responses | N-gram similarity > 0.7 |

**Output Format:**
```json
{
  "integrity_score": 85,
  "flags": [
    {
      "type": "FAST_RESPONSE",
      "question_id": "Q7",
      "detail": "Responded in 8 seconds to a system design question (avg: 45s)",
      "severity": "MEDIUM"
    }
  ],
  "recommendation": "REVIEW_FLAGGED_RESPONSES"
}
```

> **Note:** This agent is rule-based in MVP (no LLM call needed). Production version would use LLM for deeper semantic analysis.

---

## 3. Prompt Engineering Best Practices Applied

| Practice | Application |
|----------|-------------|
| **Explicit Output Format** | Every agent specifies JSON schema in the prompt |
| **Role Assignment** | Each prompt starts with "You are an expert..." to set persona |
| **Few-Shot Examples** | Question Generator includes example input/output pairs |
| **Chain-of-Thought** | Adaptive Agent and Evaluator use "Think step-by-step" instructions |
| **Rubric Grounding** | Evaluator is given explicit scoring criteria to prevent score inflation |
| **Context Limiting** | Adaptive Agent receives only last 3 turns (not full history) to manage token budget |
| **Calibration Instructions** | "Most adequate responses should score 4-6, not 7-10" prevents AI tendency toward high scores |
| **Negative Instructions** | "Never ask the same question twice" prevents common failure modes |

---

## 4. Token Budget Summary

| Agent | Calls per Interview | Tokens per Call | Total Tokens | Cost (Gemini Flash) |
|-------|-------------------|----------------|-------------|-------------------|
| Question Generator | 1 | ~1,200 | 1,200 | $0.0002 |
| Adaptive Follow-up | 10 (avg) | ~800 | 8,000 | $0.0010 |
| Response Evaluator | 10 (avg) | ~600 | 6,000 | $0.0008 |
| Feedback Synthesizer | 1 | ~1,000 | 1,000 | $0.0002 |
| Integrity Monitor | 1 | 0 (rule-based) | 0 | $0.0000 |
| **Total per Interview** | | | **~16,200** | **~$0.0022** |

**At scale:** 1,000 interviews/month = ~16.2M tokens = ~$22/month — highly cost-efficient.
