import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/interview-store';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get('interviewId');
  const agentName = searchParams.get('agentName');
  
  const logs = getAuditLogs({ interviewId, agentName });
  return NextResponse.json(logs);
}
