import { NextResponse } from 'next/server';
import { getInterview, addResponse, updateInterview } from '@/lib/interview-store';
import { orchestrate, evaluateAndAdapt, synthesizeFeedback } from '@/lib/ai-engine';

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    const { question, responseText, coverage, questionsAsked, responseTimeSec } = await req.json();
    const interview = getInterview(id);
    if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const totalExpected = 15;
    const interviewContext = { coverage, questionsAsked, totalExpected };

    // Call Evaluator AI
    const result = await orchestrate(
      id,
      'response_evaluator',
      'EVALUATE_RESPONSE',
      () => evaluateAndAdapt(question, responseText, interviewContext)
    );

    // Save response
    const savedResponse = {
      questionId: question.id,
      candidateText: responseText,
      responseTimeSec,
      depthScore: result.depthScore,
      dimensions: result.dimensions,
      action: result.action,
      nextQuestionText: result.nextQuestionText
    };
    addResponse(id, savedResponse);

    // Update coverage logic (simplified mock logic for now, you could expand this based on AI)
    const newCoverage = { ...coverage };
    if (question.category in newCoverage) {
      newCoverage[question.category] = Math.min(100, newCoverage[question.category] + 25);
    }
    const newQuestionsAsked = questionsAsked + 1;

    // Update progress
    updateInterview(id, { progress: Math.min(100, Math.round(((newQuestionsAsked - 1) / totalExpected) * 100)) });

    let feedbackResult = null;
    if (result.action === 'CONCLUDE' || newQuestionsAsked > totalExpected) {
      updateInterview(id, { status: 'COMPLETED', progress: 100 });
      // Trigger synthesize Feedback
      const finalInterview = getInterview(id);
      feedbackResult = await orchestrate(
        id,
        'feedback_synthesizer',
        'SYNTHESIZE_FEEDBACK',
        () => synthesizeFeedback(finalInterview)
      );
      updateInterview(id, { scores: feedbackResult.scores });
    }

    return NextResponse.json({
      result,
      newCoverage,
      newQuestionsAsked,
      feedbackResult
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
