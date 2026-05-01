'use client'

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import profilepic from '../pfp.png';
import { AddReRankingLike } from './AddReRankingLike';

interface Item {
  text: string;
  note?: string | null;
}

export function RerankItem({ rerank, postId, userid }: { rerank: any, postId: string, userid: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const items = (rerank.items as any as Item[]) || [];
  const rankMap = (rerank.rankMap as number[]) || [];
  const username = rerank.user?.username || "Guest";
  const firstRank = items[0]?.text || "";

  return (
    <div className="w-full border border-white/5 rounded-xl bg-white/[0.03] overflow-hidden transition-all">
      {/* Minimized View / Header */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/[0.05] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              <Image src={profilepic} alt="pfp" fill className="object-cover opacity-80" />
            </div>
            <span className="text-slate-300 text-xs sm:text-sm font-medium truncate">
              {username}
            </span>
            {!expanded && firstRank && (
               <span className="text-slate-500 text-xs sm:text-sm truncate hidden sm:inline italic font-light">
                 - {firstRank}
               </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 flex-shrink-0 ml-2">
          <AddReRankingLike 
            rerankingid={rerank.id} 
            likes={rerank.likes || 0} 
            userliked={rerank.userliked} 
            userid={userid} 
            postid={postId}
            authorid={rerank.userId}
            minimal={true}
          />
          <FontAwesomeIcon 
            icon={expanded ? faChevronUp : faChevronDown} 
            className="w-3 h-3 text-slate-600"
          />
        </div>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20">
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar py-2">
            {items.map((item, idx) => {
              const originalRank = rankMap[idx];
              const isAltered = originalRank === -1;
              const delta = (!isAltered && originalRank !== undefined) ? originalRank - idx : 0;

              return (
                <div key={idx} className="flex items-center gap-3 py-1">
                  <div className="flex items-center gap-2 flex-none">
                    <div className="w-9 flex justify-center flex-none">
                      {isAltered ? (
                        <div className="flex items-center justify-center px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter">NEW</span>
                        </div>
                      ) : delta !== 0 ? (
                        <div className={`flex items-center justify-center gap-0.5 ${delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          <FontAwesomeIcon 
                            icon={delta > 0 ? faArrowUp : faArrowDown} 
                            className="w-2 h-2" 
                          />
                          <span className="text-[9px] font-black">{Math.abs(delta)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-slate-600">
                          <FontAwesomeIcon icon={faMinus} className="w-2 h-2" />
                        </div>
                      )}
                    </div>

                    <span className="flex-none w-5 h-5 flex items-center justify-center rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-blue-400">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300 truncate font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] text-slate-500 font-bold  tracking-[0.2em]">
              {new Date(rerank.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <Link 
              href={`/post/${postId}/rerank/${rerank.id}`}
              className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-wider hover:bg-blue-600/20 transition-all active:scale-[0.98]"
            >
              Visit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
