'use client';

import { useState } from 'react';
import { faEllipsisVertical, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { ShareButton } from './ShareButton';
import { Delete } from './Delete';

interface PostActionsProps {
  postId: string;
  postTitle: string;
  postDescription?: string | null;
  items: any[];
  username: string;
  videoUrl: string | null;
  yours: boolean;
  editable: boolean;
  enableReRanking: boolean;
}

export function PostActions({ 
  postId, 
  postTitle, 
  postDescription, 
  items, 
  username, 
  videoUrl, 
  yours, 
  editable, 
  enableReRanking 
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 1. Share & Export (now styled consistently) */}
      <ShareButton 
        postId={postId}
        postTitle={postTitle}
        postDescription={postDescription}
        items={items}
        username={username}
        videoUrl={videoUrl}
      />

      {/* 2. Edit (Primary action if yours) */}
      {yours && editable && (
        <Link 
          href={`/edit/${postId}`}
          className="flex items-center justify-center gap-2 border border-white/10 rounded-xl px-4 h-10 bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-bold capitalize transition-all"
        >
          <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Link>
      )}

      {/* 3. Delete (Primary action if yours) */}
      {yours && (
        <Delete id={postId} />
      )}
    </div>
  );
}
