import { NextResponse } from 'next/server';
import { generateCompanyNames } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  let description = '';
  try {
    const body = await request.json();
    description = (body?.description ?? '').toString().trim();
  } catch {
    // body parse failure handled below
  }

  if (!description) {
    return NextResponse.json(
      { error: 'description is required' },
      { status: 400 },
    );
  }

  try {
    const names = await generateCompanyNames(description);
    return NextResponse.json({ names });
  } catch (err) {
    console.error('generate-name failed:', err);
    return NextResponse.json(
      {
        error: 'name_generation_failed',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
