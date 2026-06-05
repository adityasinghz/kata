import { NextResponse } from 'next/server';
import { getAllInterviews, createInterview, addQuestions } from '@/lib/interview-store';
import { generateQuestions, orchestrate } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getAllInterviews());
}

export async function POST(req) {
  try {
    const config = await req.json();
    const interview = createInterview(config);
    
    // Call AI Engine directly here
    const result = await orchestrate(
      interview.id,
      'question_generator',
      'GENERATE_QUESTIONS',
      () => generateQuestions(config)
    );
    
    addQuestions(interview.id, result.questions);
    
    return NextResponse.json({
      interviewId: interview.id,
      questions: result.questions,
      tokenUsage: result.tokenUsage
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
