'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { signIn } from "next-auth/react"
import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setCommentLikeStatus } from "./serverActions/changelikes";

export function AddCommentLike({ commentid, postid, userid, likes, isliked }: { commentid: string, postid: string, userid: string, likes: number, isliked: boolean }) {
  const router = useRouter();
  const [modalon, setModal] = useState(false);
  const [localLiked, setLocalLiked] = useState(isliked);
  const [, startTransition] = useTransition();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalLiked(isliked);
  }, [isliked]);

  const toggleModal = () => setModal(!modalon);

  const handleLike = () => {
    if (!userid) {
      toggleModal();
      return;
    }

    const nextLiked = !localLiked;
    setLocalLiked(nextLiked);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await setCommentLikeStatus(commentid, userid, nextLiked);
          router.refresh();
        } catch (error) {
          console.error("Sync failed:", error);
          setLocalLiked(!nextLiked);
        }
      });
    }, 250);
  }

  const displayLikes = Math.max(0, likes + (localLiked === isliked ? 0 : localLiked ? 1 : -1));

  return (
    <div className="flex items-center gap-1.5">
      <button 
        onClick={handleLike}
        className={`w-5 h-5 flex items-center justify-center transition-all duration-300 active:scale-75 ${
          localLiked ? 'text-teal-800' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <FontAwesomeIcon 
          icon={localLiked ? faHeartSolid : faHeart} 
          className={`w-3.5 h-3.5 transition-transform duration-300 ${localLiked ? 'scale-110' : 'scale-100'}`} 
        />
      </button>
      <span className={`text-[10px] font-bold tracking-tight ${localLiked ? 'text-teal-800' : 'text-slate-500'}`}>
        {displayLikes}
      </span>

      {modalon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleModal} />
          <div className="relative w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={toggleModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors">
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faHeart} className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">Join the community</h2>
              <p className="text-sm text-slate-400 leading-relaxed px-2">Sign in to like comments and join the conversation.</p>
              <button 
                onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] capitalize shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
