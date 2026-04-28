'use client';

import { useState, useRef, useEffect } from 'react';
import { faEllipsisVertical, faPen, faTrash, faShareNodes } from '@fortawesome/free-solid-svg-icons';
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
  postId, postTitle, postDescription, items, username, videoUrl, yours, editable 
}: PostActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* 1. Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all z-50 relative"
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>

      {isOpen && (
        <>
          {/* 2. The "Clickable Div" (Backdrop) */}
          {/* This covers the whole screen and closes the menu on click */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={closeMenu} 
          />

          {/* 3. The Menu Card */}
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col p-1">
              
              <ShareButton 
                postId={postId}
                postTitle={postTitle}
                postDescription={postDescription}
                items={items}
                username={username}
                videoUrl={videoUrl}
                isMenuMode={true}
              />

              {yours && editable && (
                <Link 
                  href={`/edit/${postId}`}
                  onClick={closeMenu} // Close menu after clicking
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                  Edit Post
                </Link>
              )}

              {yours && (
                <div className="border-t border-white/5 mt-1 pt-1">
                  <Delete id={postId} isMenuMode={true} /> 
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}