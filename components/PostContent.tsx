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

interface Item {
  text: string;
  note?: string | null;
  imageUrl?: string | null;
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
  dateStr,
  structuredData
}: any) {
  const [viewMode, setViewMode] = useState<'original' | 'mine'>('original');
  const [optimisticRerank, setOptimisticRerank] = useState<any>(existingUserRerank);

  // Real-time update from RerankForm
  const handleRerankSubmit = (newRerankData: any) => {
    setOptimisticRerank(newRerankData);
    setViewMode('mine');
  };

  const currentRerank = optimisticRerank;
  const hasRerank = !!currentRerank;
  const isMine = viewMode === 'mine' && hasRerank;

  const displayItems = isMine ? (currentRerank.items as any as Item[]) : (post.items as any as Item[]);

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
          <div className="flex items-center justify-between mb-3 px-1">
            <Link href={post.username ? `/user/${post.username}` : "#"} className="flex items-center gap-3 group w-fit">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-white/25 transition-all flex-shrink-0">
                <Image src={profilepic} alt={"pfp"} fill sizes="32px" className="object-cover" />
              </div>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-slate-200 text-sm font-semibold group-hover:text-blue-400 transition-colors">{post.username || "Guest"}</span>
                <span className="text-slate-500 text-[11px]">{dateStr}</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {hasRerank && (
                <button
                  onClick={() => setViewMode(viewMode === 'original' ? 'mine' : 'original')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all border ${isMine
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                    }`}
                >
                  {isMine ? "My Version" : "Original"}
                </button>
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
          <div className="w-full mb-4 min-h-[500px]" >
            <div className="grid grid-cols-1 grid-rows-1">
              <div className={`col-start-1 row-start-1 ${isMine ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none' }`}>
                <div className="rounded-xl bg-white/[0.03] p-4 sm:p-5">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5"></div>
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

              <div className={`col-start-1 row-start-1 ${!isMine ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none' }`}>
                <>
                  {post.metadata?.videoUrl ? (
                    <div className="rounded-xl overflow-hidden bg-black/20">
                      <VideoDisplay videoUrl={post.metadata.videoUrl} title={post.title} postId={id} />
                    </div>
                  ) : enableReRanking ? (
                    <div className="rounded-xl bg-white/[0.03] p-4 sm:p-5">
                      <RerankForm
                        post={post}
                        id={id}
                        initialImages={imageUrls}
                        existingRerank={currentRerank}
                        onOptimisticUpdate={handleRerankSubmit}
                      />
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
          <div className="flex items-center gap-4 px-1 mb-6 h-9">
            {isMine ? (
              <div>
                <AddReRankingLike
                  rerankingid={currentRerank.id}
                  likes={currentRerank.likes || 0}
                  userliked={currentRerank.userliked}
                  userid={userid}
                  postid={id}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <AddLike postid={id} likes={post.metadata?.likes || 0} userliked={liked} userid={userid} />
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-slate-500 text-sm">
                  <span className="text-slate-300 font-semibold">{views}</span> views
                </span>
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
          <AddComment userid={userid} postid={id} username={username} />

        </div>
      </div>
    </>
  );
}
