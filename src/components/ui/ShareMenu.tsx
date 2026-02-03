'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, X as XIcon, Linkedin, Check } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  url?: string;
  size?: 'sm' | 'md';
}

export default function ShareMenu({ title, url, size = 'sm' }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
    setOpen(false);
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
    setOpen(false);
  };

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-all"
        title="Share"
      >
        <Share2 size={iconSize} />
        {size === 'md' && <span className="text-sm">Share</span>}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={(e) => { e.stopPropagation(); copyLink(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); shareTwitter(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <XIcon size={16} />
            Share on X
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); shareLinkedIn(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Linkedin size={16} />
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  );
}
