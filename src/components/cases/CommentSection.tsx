'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  case_id: string;
  content: string;
  nickname: string;
  parent_id: string | null;
  created_at: string;
  replies?: Comment[];
}

const ANIMAL_NAMES = [
  'Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Hawk',
  'Owl', 'Lion', 'Deer', 'Seal', 'Crane', 'Koala', 'Otter', 'Lynx',
];

function generateNickname(): string {
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${animal}${num}`;
}

function getOrCreateNickname(): string {
  if (typeof window === 'undefined') return 'Anonymous';
  let nick = localStorage.getItem('comment_nickname');
  if (!nick) {
    nick = generateNickname();
    localStorage.setItem('comment_nickname', nick);
  }
  return nick;
}

export default function CommentSection({ caseId }: { caseId: string }) {
  const { lang, t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setNickname(getOrCreateNickname());
  }, []);

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded, caseId]);

  async function fetchComments() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const all: Comment[] = data as Comment[];
        const topLevel = all.filter((c) => !c.parent_id);
        const replies = all.filter((c) => c.parent_id);
        topLevel.forEach((c) => {
          c.replies = replies.filter((r) => r.parent_id === c.id);
        });
        setComments(topLevel);
      }
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('comments')
        .insert({
          case_id: caseId,
          nickname: nickname.trim(),
          content: content.trim(),
          parent_id: replyTo || null,
        });

      if (!error) {
        setContent('');
        setReplyTo(null);
        fetchComments();
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors"
      >
        <MessageCircle size={20} />
        {t('Comments', '评论')} ({comments.length})
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? t('Write a reply...', '写一条回复...') : t('Share your thoughts...', '分享你的想法...')}
                maxLength={2000}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{t('Posting as', '发表为')} <strong className="text-gray-600 dark:text-gray-300">{nickname}</strong></span>
              {replyTo && (
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-red-400 hover:text-red-500"
                >
                  {t('Cancel reply', '取消回复')}
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {comments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('No comments yet. Be the first to share your thoughts!', '暂无评论。成为第一个分享想法的人吧！')}
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {comment.nickname || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.created_at, lang)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    {t('Reply', '回复')}
                  </button>
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {reply.nickname || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(reply.created_at, lang)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
