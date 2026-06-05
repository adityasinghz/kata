import { NextResponse } from 'next/server';
import { updateInterview } from '@/lib/interview-store';

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    const reviewData = await req.json();
    const updated = updateInterview(id, {
      status: 'REVIEWED',
      review: reviewData
    });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
