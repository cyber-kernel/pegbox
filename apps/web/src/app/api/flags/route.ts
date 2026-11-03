import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const envVar = process.env.PEGBOX_DISABLED_TOOLS || '';
  const disabledTools = envVar
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return NextResponse.json(
    {
      disabledTools,
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}

