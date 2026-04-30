'use client'

import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import Script from 'next/script';
import profilepic from '../pfp.png';
import { AddLike } from "@/components/AddLike";
import { AddComment } from "@/components/AddComment";
import { ListCarousel } from "@/components/ListCarousel";
import { PostActions } from "@/components/PostActions";
import { VideoDisplay } from "@/components/VideoDisplay";
import { RerankList } from "@/components/RerankList";
import { RerankForm } from "@/components/RerankForm";
import { AddReRankingLike } from "@/components/AddReRankingLike";
import { Item } from "./serverActions/calculatererank";
import { faArrowUp, faArrowDown, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface RankedItem {
  item: Item;
  finalScore: number;
}

type ViewMode = 'original' | 'mine' | 'community';

interface PostContentProps {
  post: any;
  id: string;
  signedin: boolean;
  username: string | null;
  userid: string;
  liked: boolean;
  views: number;
  yours: boolean;
  editable: boolean;
  enableReRanking: boolean;
  imageUrls: string[];
  existingUserRerank: any;
  rerankingsWithLikes: any[];
  consensusItems: RankedItem[] | null;
  dateStr: string;
  structuredData: any;
}

export function PostContent({
  post,
  id,
  signedin,
  username,
  userid,
  liked,
  views,
  yours,
  editable,
  enableReRanking,
  imageUrls,
  existingUserRerank,
  rerankingsWithLikes,
  consensusItems,
  dateStr,
  structuredData
}: PostContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [optimisticRerank, setOptimisticRerank] = useState<any>(existingUserRerank);

  const handleRerankSubmit = (newRerankData: any) => {
    setOptimisticRerank(newRerankData);
    setViewMode('mine');
  };

  const currentRerank = optimisticRerank;
  const hasRerank = !!currentRerank;
  const hasCommunity = !!consensusItems && consensusItems.length > 0;

  const isMine = viewMode === 'mine' && hasRerank;
  const isCommunity = viewMode === 'community' && hasCommunity;
  const isOriginal = !isMine && !isCommunity;

  // Pre-calculate original item indices for delta comparison
  const originalItemMap = new Map<string, number>();
  const normalizeText = (text: string) => text.toLowerCase().trim().replace(/[^\w\s]/g, '');

  const postItems = (post.items as any as Item[] || []);
  postItems.forEach((item, index) => {
    originalItemMap.set(normalizeText(item.text), index);
  });

  const displayItems: Item[] = isMine
    ? (currentRerank.items as any as Item[])
    : (isCommunity && consensusItems)
      ? consensusItems.map((r: RankedItem) => r.item)
      : postItems;

  const isAuthor = userid === post.authorId;
  const canRerank = enableReRanking && !isAuthor;

  const showToggle = hasRerank || hasCommunity;

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex justify-center px-4 sm:px-6 pb-20 min-h-[calc(100vh-52px)] pt-[140px] lg:pt-[100px]">
        <div className="w-full max-w-2xl flex flex-col">

          {/* AUTHOR ROW */}
          <div className="flex items-center justify-between mb-3 px-1 gap-4">
            {/* Left side: Username - added 'min-w-0' to allow truncation if needed */}
            <Link href={post.username ? `/user/${post.username}` : "#"} className="flex items-center gap-3 group min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <Image src={profilepic} alt={"pfp"} fill sizes="32px" className="object-cover" />
              </div>
              <div className="flex flex-col leading-none gap-0.5 truncate">
                <span className="text-slate-200 text-sm font-semibold group-hover:text-blue-400 transition-colors truncate">
                  {post.username || "Guest"}
                </span>
                <span className="text-slate-500 text-[11px]">{dateStr}</span>
              </div>
            </Link>
            {/* Right side: Toggles and Meatball Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showToggle && (
                <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase transition-all ${isOriginal
                      ? "bg-white/10 text-slate-200 shadow"
                      : "text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    Original
                  </button>
                  {hasRerank && (
                    <button
                      onClick={() => setViewMode('mine')}
                      className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase transition-all ${isMine
                        ? "bg-blue-600 text-white shadow shadow-blue-600/30"
                        : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      Mine
                    </button>
                  )}
                  {hasCommunity && (
                    <button
                      onClick={() => setViewMode('community')}
                      className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase transition-all ${isCommunity
                        ? "bg-violet-600 text-white shadow shadow-violet-600/30"
                        : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      Community
                    </button>
                  )}
                </div>
              )}
              <PostActions
                postId={id}
                postTitle={post.title}
                postDescription={post.description}
                items={(post.items as any)}
                username={post.username || ""}
                videoUrl={post.metadata?.videoUrl || null}
                yours={yours}
                editable={editable}
                enableReRanking={enableReRanking}
              />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-tight mb-4 px-1">
            {post.title}
          </h1>

          {/* MEDIA / RANKING BLOCK */}
          <div className="w-full mb-4 min-h-[500px]">
            <div className="grid grid-cols-1 grid-rows-1">

              {/* MINE view */}
              <div className={`col-start-1 row-start-1 ${isMine ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="rounded-xl bg-white/[0.03] p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-2.5">
                    {isMine && displayItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-2xl border bg-black/40 border-white/5">
                        <div className="flex-none w-11 h-11 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-blue-400 font-bold text-base">
                          {index + 1}
                        </div>
                        <div className="flex-none relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.text} fill sizes="96px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="w-full text-lg text-slate-100 font-semibold py-1 truncate">{item.text}</div>
                          {item.note && <div className="text-[11px] font-bold text-slate-500 capitalize opacity-60">{item.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMMUNITY view */}
              <div className={`col-start-1 row-start-1 ${isCommunity ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="rounded-xl bg-white/[0.03] p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-black text-violet-400 tracking-widest uppercase">
                      Community Consensus · {rerankingsWithLikes.length} rerank{rerankingsWithLikes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {isCommunity && (consensusItems as RankedItem[]).map((ranked, index) => {
                      const item = ranked.item as Item;
                      const originalIndex = originalItemMap.get(normalizeText(item.text));
                      const isAltered = originalIndex === undefined;
                      const delta = (!isAltered && originalIndex !== undefined) ? originalIndex - index : 0;

                      return (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-2xl border bg-black/40 border-violet-500/10">
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

                            <div className="flex-none w-11 h-11 flex items-center justify-center rounded-xl bg-black/40 border border-violet-500/20 text-violet-400 font-bold text-base">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-none relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.text} fill sizes="96px" className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/5" />
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="w-full text-lg text-slate-100 font-semibold py-1 truncate">{item.text}</div>
                            {item.note && <div className="text-[11px] font-bold text-slate-500 capitalize opacity-60">{item.note}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ORIGINAL view (also houses the rerank form) */}
              <div className={`col-start-1 row-start-1 ${isOriginal ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <>
                  {post.metadata?.videoUrl ? (
                    <div className="rounded-xl overflow-hidden bg-black/20">
                      <VideoDisplay videoUrl={post.metadata.videoUrl} title={post.title} postId={id} />
                    </div>
                  ) : enableReRanking ? (
                    <div className="rounded-xl bg-white/[0.03] p-4 sm:p-5">
                      {canRerank ? (
                        <RerankForm
                          post={post}
                          id={id}
                          initialImages={imageUrls}
                          existingRerank={currentRerank}
                          onOptimisticUpdate={handleRerankSubmit}
                        />
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {displayItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-2xl border bg-black/40 border-white/5">
                              <div className="flex-none w-11 h-11 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-blue-400 font-bold text-base">
                                {index + 1}
                              </div>
                              <div className="flex-none relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10">
                                {item.imageUrl ? (
                                  <Image src={item.imageUrl} alt={item.text} fill sizes="96px" className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/5" />
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="w-full text-lg text-slate-100 font-semibold py-1 truncate">{item.text}</div>
                                {item.note && <div className="text-[11px] font-bold text-slate-500 capitalize opacity-60">{item.note}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : post.metadata?.images ? (
                    <div className="rounded-xl overflow-hidden">
                      <ListCarousel items={(post.items as any)} postid={id} firstimage={true} />
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {displayItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.04]">
                          <span className="flex-none w-7 h-7 flex items-center justify-center rounded-md bg-blue-500/10 text-[11px] font-black text-blue-400 tabular-nums">
                            {index + 1}
                          </span>
                          <span className="text-slate-200 text-base font-medium truncate">{item.text}</span>
                          {item.note && <span className="ml-auto text-slate-500 text-xs truncate max-w-[30%]">{item.note}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              </div>

            </div>
          </div>

          {/* DESCRIPTION */}
          {post.description && (
            <p className="text-slate-400 text-sm leading-relaxed mb-5 px-1">
              {post.description}
            </p>
          )}

          {/* ENGAGEMENT ROW */}
          <div className="flex items-center justify-between px-1 mb-8 border-y border-white/[0.04] py-4">
            {isMine ? (
              <div className="flex items-center gap-6">
                <AddReRankingLike
                  rerankingid={currentRerank.id}
                  likes={currentRerank.likes || 0}
                  userliked={currentRerank.userliked}
                  userid={userid}
                  postid={id}
                  authorid={currentRerank.userId}
                />
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <AddLike postid={id} likes={post.metadata?.likes || 0} userliked={liked} userid={userid} authorid={post.authorId} />
                <div className="flex items-center gap-3 border-l border-white/10 pl-8 h-10">
                  <div className="flex flex-col leading-tight">
                    <span className="text-slate-200 font-bold text-base tracking-tight">
                      {views.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Views</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RE-RANKINGS */}
          {rerankingsWithLikes.length > 0 && (
            <div className="mb-6 px-1">
              <RerankList rerankings={rerankingsWithLikes} postId={id} userid={userid} />
            </div>
          )}

          {/* COMMENTS */}
          <AddComment userid={userid ?? ""} postid={id} username={username} />

        </div>
      </div>
    </>
  );
}