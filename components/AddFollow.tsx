'use client'

import { useRef, useState } from "react";
import { addFollow, removeFollow } from "./serverActions/changefollow";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";

interface AddFollowProps {
  following: boolean;
  profileid: string;
  userid?: string; // Optional because user might be logged out
  username: string;
  followerCount: number;
  followingCount: number;
  isOwnProfile: boolean;
}

export function AddFollow({ following, profileid, userid, username, followerCount, followingCount, isOwnProfile }: AddFollowProps) {
  const count = useRef(0);
  const [followed, setFollowed] = useState(following);
  const [quickfollow, setQuickFollow] = useState(0);
  const [modalon, setModal] = useState(false);
  const [pause, setPause] = useState(false);

  const toggleFollow = async () => {
    if (pause || isOwnProfile) return;
    
    count.current = count.current + 1;
    if (count.current > 6) return; // Basic rate limit

    setPause(true);
    if (followed) {
      setFollowed(false);
      setQuickFollow(prev => prev - 1);
      await removeFollow(profileid, userid!);
    } else {
      setFollowed(true);
      setQuickFollow(prev => prev + 1);
      await addFollow(profileid, userid!);
    }

    setTimeout(() => setPause(false), 1000);
  };

  return (
    <div className="flex flex-row items-center justify-between w-full">
      {/* 1. Identity Section: Always visible */}
      <div className="flex flex-col">
        <h1 className="text-4xl text-offwhite font-bold">{username}</h1>
        <div className="flex flex-row space-x-4">
          <h2 className="text-sm text-slate-400 mt-1">
            <span className="text-offwhite font-semibold">{followerCount + quickfollow}</span> Followers
          </h2>
          <h2 className="text-sm text-slate-400 mt-1">
            <span className="text-offwhite font-semibold">{followingCount}</span> Following
          </h2>
        </div>
      </div>

      {/* 2. Action Section: Context-aware */}
      <div className="ml-4">
        {isOwnProfile ? (
          // Case A: User is looking at themselves
          <button className="outline outline-2 outline-slate-700 rounded-md px-4 py-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-300 transition-all">
            Edit Profile
          </button>
        ) : userid ? (
          // Case B: Logged in and looking at someone else
          <button 
            onClick={toggleFollow} 
            className={`outline outline-2 outline-slate-700 rounded-md py-2 w-[100px] transition-all bg-slate-50 bg-opacity-5 group ${
              followed ? 'hover:bg-red-600 hover:bg-opacity-20' : 'hover:bg-opacity-10'
            }`}
          >
            {followed ? (
              <>
                <span className="group-hover:hidden text-slate-400">Following</span>
                <span className="hidden group-hover:block text-red-400">Unfollow?</span>
              </>
            ) : (
              <span className="text-slate-400">Follow</span>
            )}
          </button>
        ) : (
          // Case C: Logged out
          <>
            <button 
              onClick={() => setModal(true)} 
              className="outline outline-2 outline-slate-700 rounded-md px-6 py-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400"
            >
              Follow
            </button>
            
            {modalon && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-80 flex flex-col items-center shadow-2xl">
                  <div className="flex w-full justify-end mb-2">
                    <button onClick={() => setModal(false)}>
                      <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-500 hover:text-white transition-colors" />
                    </button> 
                  </div>
                  <h2 className="text-slate-200 text-xl font-bold text-center mb-6">Join the community to follow {username}</h2>
                  <button 
                    onClick={() => signIn(undefined, { callbackUrl: `/user/${username.toLowerCase()}` })} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Sign In / Sign Up
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}