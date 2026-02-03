import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { case_id, vote_type, fingerprint } = body;

    if (!case_id || !vote_type || ![1, -1].includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Try authenticated user first, fall back to fingerprint
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {}

    const voterKey = userId || fingerprint;
    if (!voterKey) {
      return NextResponse.json({ error: 'No identifier provided' }, { status: 400 });
    }

    // Use fingerprint as voter_id for anonymous voting
    const voterId = userId || `anon_${fingerprint}`;

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('case_id', case_id)
      .eq('user_id', voterId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Same vote - remove it (toggle off)
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;
        return NextResponse.json({ action: 'removed', vote_type: null });
      } else {
        // Different vote - update it
        const { error } = await supabase
          .from('votes')
          .update({ vote_type })
          .eq('id', existingVote.id);

        if (error) throw error;
        return NextResponse.json({ action: 'updated', vote_type });
      }
    } else {
      // New vote
      const { error } = await supabase
        .from('votes')
        .insert({ case_id, user_id: voterId, vote_type });

      if (error) throw error;
      return NextResponse.json({ action: 'created', vote_type });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}
