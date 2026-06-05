import { NextResponse } from 'next/server';
import { getDashboardStats, getAllInterviews } from '@/lib/interview-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    stats: getDashboardStats(),
    interviews: getAllInterviews().slice(0, 10) // recent
  });
}
