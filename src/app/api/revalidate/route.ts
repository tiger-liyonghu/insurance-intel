import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const path = request.nextUrl.searchParams.get('path');

  // Validate token
  if (token !== process.env.VERCEL_REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate', details: (error as Error).message },
      { status: 500 }
    );
  }
}
