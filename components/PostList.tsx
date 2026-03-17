'use client'

import Link from "next/link"
import { ListCarousel } from "./ListCarousel"
import { VideoDisplay } from "./VideoDisplay"
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadBatch, LoadBatchCat } from "./serverActions/loadposts";

export default function PostsList({ starter }: { starter: any }) {
  const [posts, setPosts] = useState(starter);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [lockcat, setLockCat] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [date, setDate] = useState("All Time");
  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (currentBatch: number, currentSort: string, currentCat: string, currentDate: string, isInitial: boolean = false) => {
    try {
      setLoading(true);
      const categoryToLoad = currentCat === "Custom" ? "c" + lockcat : currentCat;
      const newPosts = await LoadBatch(currentBatch, currentSort, categoryToLoad, currentDate);

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts: any) => [...prevPosts, ...newPosts]);
      }

      if (newPosts.length === 0) {
        setEnd(true);
      } else {
        setEnd(false);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, [lockcat]);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !end) {
          batch.current += 1;
          fetchPosts(batch.current, sort, category, date);
        }
      },
      { threshold: 0.1 }
    );

    const currentObserver = observer.current;
    if (observerRef.current) {
      currentObserver.observe(observerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, end, category, date, sort, fetchPosts]);

  const handleFilterChange = (type: 'category' | 'sort' | 'date', value: string) => {
    let nextCat = category;
    let nextSort = sort;
    let nextDate = date;

    if (type === 'category') {
      nextCat = value;
      setCategory(value);
      if (value !== 'Custom') setLockCat("");
    } else if (type === 'sort') {
      nextSort = value;
      setSort(value);
    } else if (type === 'date') {
      nextDate = value;
      setDate(value);
    }

    // Reset and fetch
    batch.current = 0;
    setEnd(false);
    if (value !== 'Custom' || type !== 'category') {
      fetchPosts(0, nextSort, nextCat, nextDate, true);
    } else {
      setPosts([]);
    }
  }

  const lockCategory = (e: any) => {
    e.preventDefault();
    const inputvalue = e.target.closest('div').querySelector('input').value;
    setLockCat(inputvalue);
    batch.current = 0;
    setEnd(false);
    fetchPosts(0, sort, "c" + inputvalue, date, true);
  }

  const getPostDate = (postDate: Date): string => {
    const now = new Date();
    const diff = now.getTime() - postDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (diff / 1000 < 60) {
      return "Seconds ago";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return postDate.toLocaleDateString('en-US', options);
    }
  }

  return (
    <div className="w-full">
      {/* Sorting & Filtering UI - Seamless Header */}
      <div className="sticky top-[52px] bg-black/95 backdrop-blur-md border-b border-white/10 z-50 px-3 sm:px-4 py-2 flex overflow-x-auto no-scrollbar items-center justify-start gap-x-3 sm:gap-x-6">
        
        {/* Category Filter */}
        <div className="flex items-center space-x-1 shrink-0">
          <label className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-widest translate-y-[0.5px]">Topic</label>
          <div className="relative">
            <select 
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="bg-transparent border-none text-[12px] text-slate-300 focus:outline-none focus:ring-0 cursor-pointer font-bold uppercase tracking-wider p-0 pr-4 appearance-none leading-tight"
            >
              <option value="All" className="bg-slate-900">All</option>
              <option value="None" className="bg-slate-900">None</option>
              <option value="Gaming" className="bg-slate-900">Gaming</option>
              <option value="Music" className="bg-slate-900">Music</option>
              <option value="Movies" className="bg-slate-900">Movies</option>
              <option value="TV Shows" className="bg-slate-900">TV Shows</option>
              <option value="Tech" className="bg-slate-900">Tech</option>
              <option value="Sports" className="bg-slate-900">Sports</option>
              <option value="Memes" className="bg-slate-900">Memes</option>
              <option value="Fashion" className="bg-slate-900">Fashion</option>
              <option value="Food & Drink" className="bg-slate-900">Food</option>
              <option value="Celebrities" className="bg-slate-900">Stars</option>
              <option value="Lifestyle" className="bg-slate-900">Life</option>
              <option value="Books" className="bg-slate-900">Books</option>
              <option value="Science & Nature" className="bg-slate-900">Nature</option>
              <option value="Education" className="bg-slate-900">Learn</option>
              <option value="Custom" className="bg-slate-900">Custom</option>
            </select>
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-1 border-l border-white/10 pl-2 sm:pl-4 shrink-0">
          <label className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-widest translate-y-[0.5px]">Rank</label>
          <div className="relative">
            <select 
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-transparent border-none text-[12px] text-slate-300 focus:outline-none focus:ring-0 cursor-pointer font-bold uppercase tracking-wider p-0 pr-4 appearance-none leading-tight"
            >
              <option value="Newest" className="bg-slate-900">New</option>
              <option value="Most Viewed" className="bg-slate-900">Views</option>
              <option value="Most Liked" className="bg-slate-900">Likes</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center space-x-1 border-l border-white/10 pl-2 sm:pl-4 shrink-0">
          <label className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-widest translate-y-[0.5px]">Time</label>
          <div className="relative">
            <select 
              value={date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="bg-transparent border-none text-[12px] text-slate-300 focus:outline-none focus:ring-0 cursor-pointer font-bold uppercase tracking-wider p-0 pr-4 appearance-none leading-tight"
            >
              <option value="All Time" className="bg-slate-900">All</option>
              <option value="Today" className="bg-slate-900">Day</option>
              <option value="This Week" className="bg-slate-900">Week</option>
              <option value="This Month" className="bg-slate-900">Month</option>
              <option value="This Year" className="bg-slate-900">Year</option>
            </select>
          </div>
        </div>

        {category === "Custom" && !lockcat && (
          <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0 border-l border-white/10 pl-3 sm:pl-4 shrink-0">
            <input 
              maxLength={16} 
              placeholder="..."
              className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all w-16 uppercase font-bold tracking-wider"
            />
            <button 
              onClick={lockCategory} 
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              Go
            </button>
          </div>
        )}

        {category === "Custom" && lockcat && (
          <div className="flex items-center border-l border-white/10 pl-4 shrink-0">
            <span className="text-[11px] font-bold text-blue-500 uppercase border border-blue-500/30 px-2 py-0.5 rounded tracking-widest">
              {lockcat}
            </span>
          </div>
        )}
      </div>

      {/* Posts List - Seamless Feed */}
      <div className="flex flex-col">
        {posts?.map((list: any, index: number) => (
          <article key={list.id} className="relative border-b border-white/10 hover:bg-white/[0.02] transition-colors group">
            {/* Background Link for "outer border" redirect */}
            <Link href={`/post/${list.id}`} className="absolute inset-0 z-0" aria-label={`View ${list.title}`} />
            
            <div className="relative z-10 p-4 sm:p-6 space-y-4 pointer-events-none">
              {/* Post Header: Title */}
              <h2 className="text-xl md:text-2xl font-semibold text-slate-100 line-clamp-2 leading-tight tracking-tight pointer-events-auto">
                <Link href={`/post/${list.id}`} className="hover:text-blue-400 transition-colors">
                  {list.title}
                </Link>
              </h2>

              {/* Content Area */}
              <div className="rounded-lg overflow-hidden border border-white/5 pointer-events-auto bg-black/20">
                {list.metadata?.videos && list.metadata.videoUrl ? (
                  <VideoDisplay videoUrl={list.metadata.videoUrl} title={list.title} postId={list.id} variant="preview" />
                ) : list.metadata?.images ? (
                  <ListCarousel ranks={[list.rank1, list.rank2, list.rank3, list.rank4, list.rank5]} postid={list.id} firstimage={index === 0} />
                ) : (
                  <div className="p-4 bg-white/[0.03] space-y-3">
                    <ol className="space-y-2 list-decimal list-inside text-slate-400 text-base md:text-lg">
                      <li className="truncate pl-2"><span className="text-slate-300">{list.rank1}</span></li>
                      <li className="truncate pl-2"><span className="text-slate-300">{list.rank2}</span></li>
                      {list.rank3 && <li className="truncate pl-2"><span className="text-slate-300">{list.rank3}</span></li>}
                      {list.rank4 && <li className="truncate pl-2"><span className="text-slate-300">{list.rank4}</span></li>}
                      {list.rank5 && <li className="truncate pl-2"><span className="text-slate-300">{list.rank5}</span></li>}
                    </ol>
                  </div>
                )}
              </div>

              {/* Post Footer: Stats & Date */}
              <div className="flex items-center justify-between text-[13px] text-slate-500 font-medium pt-1 pointer-events-auto">
                <div className="flex items-center space-x-5">
                  <div className="flex items-center group/stat">
                    <span className="text-slate-400 group-hover/stat:text-blue-400 transition-colors">{list.metadata?.likes ?? 0} likes</span>
                  </div>
                  <div className="flex items-center group/stat">
                    <span className="text-slate-400 group-hover/stat:text-blue-400 transition-colors">{list.metadata?.views ?? 0} views</span>
                  </div>
                </div>
                {list.metadata?.date && (
                  <time className="text-slate-600">{getPostDate(new Date(list.metadata.date))}</time>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Loading States */}
      <div ref={observerRef} className="py-12 flex items-center justify-center">
        {loading && (
          <div className="w-6 h-6 border-2 border-blue-500/50 border-t-transparent rounded-full animate-spin"></div>
        )}
        {end && !loading && (
          <div className="text-slate-600 text-[13px] font-semibold uppercase tracking-widest">
            End of Feed
          </div>
        )}
      </div>
    </div>
  )
}
