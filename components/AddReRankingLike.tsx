'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { signIn } from "next-auth/react"
import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setReRankingLikeStatus } from "./serverActions/changelikes";

export function AddReRankingLike({ 
  rerankingid, 
  likes, 
  userliked, 
  userid, 
  postid,
  minimal = false 
}: { 
  rerankingid: string, 
  likes: number, 
  userliked: boolean, 
  userid: string | null,
  postid: string,
  minimal?: boolean
}) {
  const router = useRouter();
  const [modalon, setModal] = useState(false);
  const [localLiked, setLocalLiked] = useState(userliked);
  const [, startTransition] = useTransition();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalLiked(userliked);
  }, [userliked]);

  const toggleModal = () => setModal(!modalon);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding the rerank item if it's inside one
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
          await setReRankingLikeStatus(rerankingid, userid, nextLiked);
          router.refresh();
        } catch (error) {
          console.error("Sync failed:", error);
          setLocalLiked(!nextLiked);
        }
      });
    }, 250);
  }

  const displayLikes = Math.max(0, likes + (localLiked === userliked ? 0 : localLiked ? 1 : -1));

  if (minimal) {
    return (
      <>
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-1.5 transition-colors active:scale-90 ${
            localLiked ? 'text-teal-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FontAwesomeIcon icon={localLiked ? faHeartSolid : faHeart} className="w-3 h-3" />
          <span className="text-[10px] font-bold">{displayLikes}</span>
        </button>

        {modalon && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleModal} />
            <div className="relative w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <button onClick={toggleModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                  <FontAwesomeIcon icon={faHeart} className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight">Join the community</h2>
                <p className="text-sm text-slate-400 leading-relaxed px-2">Sign in to like this re-ranking and save it to your profile.</p>
                <button 
                  onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-normal capitalize shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleLike}
        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-75 bg-white/5 border-white/10 ${
          localLiked ? 'text-teal-800' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
        }`}
      >
        <FontAwesomeIcon 
          icon={localLiked ? faHeartSolid : faHeart} 
          className={`w-4 h-4 transition-transform duration-300 ${localLiked ? 'scale-110' : 'scale-100'}`} 
        />
      </button>
      
      <div className="flex flex-col">
        <span className="text-slate-200 font-bold text-base tracking-tight">
          {displayLikes}
        </span>
        <span className="text-xs text-slate-500 font-bold tracking-normal capitalize">Likes</span>
      </div>

      {modalon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleModal} />
          <div className="relative w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button onClick={toggleModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors">
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faHeart} className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">Join the community</h2>
              <p className="text-sm text-slate-400 leading-relaxed px-2">Sign in to like this re-ranking and save it to your profile.</p>
              <button 
                onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} 
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-normal capitalize shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
