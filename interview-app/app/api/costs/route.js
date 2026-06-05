import { NextResponse } from 'next/server';
import { getAggregateCosts } from '@/lib/interview-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getAggregateCosts());
}
