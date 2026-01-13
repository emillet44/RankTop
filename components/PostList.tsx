'use client'

import Link from "next/link"
import { ListCarousel } from "./ListCarousel"
import { VideoDisplay } from "./VideoDisplay"
import { useEffect, useRef, useState } from "react";
import { LoadBatch, LoadBatchCat } from "./serverActions/loadposts";

export default function PostsList({ starter }: { starter: any }) {
  const [posts, setPosts] = useState(starter);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [lockcat, setLockCat] = useState("");
  const [category, setCategory] = useState("None");
  const [sort, setSort] = useState("Category");
  const [date, setDate] = useState("Today");
  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const addPostsCat = async (category: string) => {
    try {
      const posts = await LoadBatchCat(batch.current, category);
      setPosts((prevPosts: any) => [...prevPosts, ...posts]);

      if (posts.length === 0) {
        setEnd(true);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPosts = async (type: string, date: string) => {
    try {
      const posts = await LoadBatch(batch.current, type, date);
      if (posts) {
        setPosts((prevPosts: any) => [...prevPosts, ...posts]);

        if (posts.length === 0) {
          setEnd(true);
        }
      }
      else {
        throw ("Post metadata couldn't be read.");
      }

    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !end) {
          setLoading(true);
          batch.current += 1;
          if (sort == "Category") {
            if (category != "Custom") {
              addPostsCat(category);
            }
            else {
              addPostsCat("c" + lockcat);
            }
          }
          else {
            addPosts(sort, date);
          }
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
  }, [loading, end]);

  const loadCategory = (e: any) => {
    if (lockcat != "") {
      setLockCat("");
    }
    setCategory(e.target.value);
    setPosts([]);
    if (e.target.value != "Custom") {
      batch.current = 0;
      setEnd(false);
      setLoading(true);
      addPostsCat(e.target.value);
    }
  }

  const lockCategory = (e: any) => {
    e.preventDefault();
    const inputvalue = e.target.closest('div').querySelector('input').value;
    setLockCat(inputvalue);
    batch.current = 0;
    setEnd(false);
    setLoading(true);
    setPosts([]);
    addPostsCat("c" + inputvalue);
  }

  const loadSort = (e: any) => {
    setSort(e.target.value);
    setPosts([]);
    setEnd(false);
    setLoading(true);
    batch.current = 0;
    if (e.target.value == "Category") {
      setCategory("None");
      addPostsCat("None");
    }
    else {
      addPosts(e.target.value, date);
    }
  }

  const loadDate = (e: any) => {
    setDate(e.target.value);
    setPosts([]);
    setEnd(false);
    setLoading(true);
    batch.current = 0;
    addPosts(sort, e.target.value);
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
    <>
      <div className="sm:border-x border-b p-8 w-full border-slate-700">
        <div className="flex flex-row space-y-3">
          <label className="text-xl text-slate-400 pr-1 flex pt-4">Sort by:</label>
          <select onChange={loadSort} className="w-[133px] p-2 pr-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
            <option className="text-black">Category</option>
            <option className="text-black">Most Viewed</option>
            <option className="text-black">Most Liked</option>
          </select>
        </div>
        {sort == "Category" &&
          <div className={`flex ${category === 'Custom' ? 'flex-wrap' : 'flex-row'} space-y-3`}>
            <label className="text-xl text-slate-400 pr-1 flex pt-4">Category:</label>
            <select onChange={loadCategory} className="w-[165px] p-2 pr-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
              <option className="text-black">None</option>
              <option className="text-black">Gaming</option>
              <option className="text-black">Music</option>
              <option className="text-black">Movies</option>
              <option className="text-black">TV Shows</option>
              <option className="text-black">Tech</option>
              <option className="text-black">Sports</option>
              <option className="text-black">Memes</option>
              <option className="text-black">Fashion</option>
              <option className="text-black">Food & Drink</option>
              <option className="text-black">Celebrities</option>
              <option className="text-black">Lifestyle</option>
              <option className="text-black">Books</option>
              <option className="text-black">Science & Nature</option>
              <option className="text-black">Education</option>
              <option className="text-black">Custom</option>
            </select>
            {category == "Custom" &&
              <>
                {!lockcat &&
                  <div className=" pl-2 flex items-center space-x-2">
                    <input maxLength={16} className="text-xl text-slate-400 outline-none border-b border-slate-400 bg-transparent placeholder:text-slate-400 w-48" />
                    <button onClick={lockCategory} className="outline outline-2 outline-slate-700 rounded-md p-1 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Search</button>
                  </div>
                }
                {lockcat &&
                  <label className="pl-2 flex items-center text-xl text-slate-400">{lockcat}</label>
                }
              </>
            }
          </div>
        }
        {sort != "Category" &&
          <div className="flex flex-row space-y-3">
            <label className="text-xl text-slate-400 pr-1 flex pt-4">Date:</label>
            <select onChange={loadDate} className="w-[119px] p-2 pr-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
              <option className="text-black">Today</option>
              <option className="text-black">This Week</option>
              <option className="text-black">This Month</option>
              <option className="text-black">This Year</option>
              <option className="text-black">All Time</option>
            </select>
          </div>
        }
      </div>
      {posts?.map((list: any, index: number) => (
        <Link href={`/post/${list.id}`} className="w-full" key={list.id}>
          {/* Video posts */}
          {list.metadata?.videos && list.metadata.videoUrl ? (
            <div className="pt-8 pb-4 sm:border-x border-b border-slate-700">
              <header className="pl-8 text-4xl line-clamp-2 leading-tight text-slate-400 font-semibold pb-2">{list.title}</header>
              <VideoDisplay 
                videoUrl={list.metadata.videoUrl} 
                postid={list.id} 
                title={list.title}
                variant="preview" 
              />
              <div className="flex flex-row justify-between items-center border-t border-slate-100 pt-4 mx-8 mt-8">
                <div>
                  <label className="text-xl text-slate-400">{list.metadata.likes} likes</label>
                  <label className="ml-6 text-xl text-slate-400">{list.metadata.views} views</label>
                </div>
                <label className="text-xl text-slate-400">{getPostDate(new Date(list.metadata.date))}</label>
              </div>
            </div>
          ) : list.metadata?.images ? (
            /* Image posts */
            <div className="pt-8 pb-4 sm:border-x border-b border-slate-700">
              <header className="pl-8 text-4xl line-clamp-2 leading-tight text-slate-400 font-semibold">{list.title}</header>
              <ListCarousel ranks={[list.rank1, list.rank2, list.rank3, list.rank4, list.rank5]} postid={list.id} firstimage={index === 0} />
              <div className="flex flex-row justify-between items-center border-t border-slate-100 pt-4 mx-8 mt-8">
                <div>
                  <label className="text-xl text-slate-400">{list.metadata.likes} likes</label>
                  <label className="ml-6 text-xl text-slate-400">{list.metadata.views} views</label>
                </div>
                <label className="text-xl text-slate-400">{getPostDate(new Date(list.metadata.date))}</label>
              </div>
            </div>
          ) : (
            /* Text-only posts */
            <div className="sm:border-x border-b border-slate-700">
              <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8">
                <header className="text-4xl line-clamp-2 leading-tight text-slate-400 font-semibold">{list.title}</header>
                <li className="truncate text-xl text-slate-400">{list.rank1}</li>
                <li className="truncate text-xl text-slate-400">{list.rank2}</li>
                <li className="empty:hidden truncate text-xl text-slate-400">{list.rank3}</li>
                <li className="empty:hidden truncate text-xl text-slate-400">{list.rank4}</li>
                <li className="empty:hidden truncate text-xl text-slate-400">{list.rank5}</li>
              </ul>
              <div className="flex flex-row justify-between items-center border-t border-slate-100 py-4 mx-8">
                <div>
                  <label className="text-xl text-slate-400">{list.metadata.likes} likes</label>
                  <label className="ml-6 text-xl text-slate-400">{list.metadata.views} views</label>
                </div>
                <label className="text-xl text-slate-400">{getPostDate(new Date(list.metadata.date))}</label>
              </div>
            </div>
          )}
        </Link>
      ))}
      <div ref={observerRef} className="h-[1px]" />
      {loading &&
        <header className="text-offwhite">Loading more posts...</header>
      }
      {end && !loading &&
        <header className="text-offwhite">No more posts to display!</header>
      }
    </>
  )
}