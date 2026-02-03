'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VoteButtonsProps {
  caseId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  size?: 'sm' | 'md';
}

function getFingerprint(): string {
  if (typeof window === 'undefined') return '';
  let fp = localStorage.getItem('vote_fingerprint');
  if (!fp) {
    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('vote_fingerprint', fp);
  }
  return fp;
}

function getLocalVote(caseId: string): number | null {
  if (typeof window === 'undefined') return null;
  const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
  return votes[caseId] ?? null;
}

function setLocalVote(caseId: string, vote: number | null) {
  if (typeof window === 'undefined') return;
  const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
  if (vote === null) {
    delete votes[caseId];
  } else {
    votes[caseId] = vote;
  }
  localStorage.setItem('user_votes', JSON.stringify(votes));
}

export default function VoteButtons({ caseId, initialUpvotes, initialDownvotes, size = 'sm' }: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserVote(getLocalVote(caseId));
  }, [caseId]);

  const handleVote = async (voteType: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const voterId = `anon_${getFingerprint()}`;

      const { data: existingVote } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('case_id', caseId)
        .eq('user_id', voterId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase.from('votes').delete().eq('id', existingVote.id);
          if (voteType === 1) setUpvotes((v) => v - 1);
          else setDownvotes((v) => v - 1);
          setUserVote(null);
          setLocalVote(caseId, null);
        } else {
          await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id);
          if (userVote === 1) setUpvotes((v) => v - 1);
          if (userVote === -1) setDownvotes((v) => v - 1);
          if (voteType === 1) setUpvotes((v) => v + 1);
          else setDownvotes((v) => v + 1);
          setUserVote(voteType);
          setLocalVote(caseId, voteType);
        }
      } else {
        await supabase.from('votes').insert({ case_id: caseId, user_id: voterId, vote_type: voteType });
        if (userVote === 1) setUpvotes((v) => v - 1);
        if (userVote === -1) setDownvotes((v) => v - 1);
        if (voteType === 1) setUpvotes((v) => v + 1);
        else setDownvotes((v) => v + 1);
        setUserVote(voteType);
        setLocalVote(caseId, voteType);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 14 : 18;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
          userVote === 1
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600'
        }`}
      >
        <ThumbsUp size={iconSize} />
        <span className={textSize}>{upvotes}</span>
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1); }}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
          userVote === -1
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600'
        }`}
      >
        <ThumbsDown size={iconSize} />
        <span className={textSize}>{downvotes}</span>
      </button>
    </div>
  );
}
