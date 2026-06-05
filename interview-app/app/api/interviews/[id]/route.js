import { NextResponse } from 'next/server';
import { getInterview, updateInterview } from '@/lib/interview-store';

// GET /api/interviews/[id]
// Retrieve a specific interview
export async function GET(req, { params }) {
  const { id } = await params;
  const interview = getInterview(id);
  if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(interview);
}

// PUT /api/interviews/[id]
// Update interview status or details
export async function PUT(req, { params }) {
  const { id } = await params;
  const updates = await req.json();
  const interview = updateInterview(id, updates);
  if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(interview);
}
