'use client'

import Link from "next/link"
import Image from 'next/image';
import { useEffect, useRef, useState } from "react";
import { LoadUserPosts } from "./serverActions/loadposts";


//make sure intersection observer is working properly

export default function ProfilePostList({ starter, profileid }: { starter: any, profileid: string }) {
  const [posts, setPosts] = useState(starter);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const addPosts = async () => {
    try {
      const posts = await LoadUserPosts(batch.current, profileid);
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
          addPosts();
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

  return (
    <>
      <div className="pt-4 max-w-7xl grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"> {posts?.map((post: any) => (
        <Link href={`/post/${post.id}`} key={post.id}>
          <div className="rounded-sm p-5 bg-white shadow-lg shadow-black bg-opacity-5 hover:scale-105">
            <div className="h-64 max-w-[370px] text-left">
              {post.metadata?.images &&
                <>
                  <header className="text-2xl line-clamp-2 text-slate-400 font-semibold truncate text-ellipsis">{post.title}</header>
                  <h1 className="truncate text-slate-400">{"1. " + post.rank1}</h1>
                  <div className="bg-black h-52 rounded-md">
                    <Image src={`https://storage.googleapis.com/ranktop-i/${post.id}1.png`} alt={"Image 1"} width={1920} height={1080} className="object-contain h-full rounded-md" />
                  </div>
                </>
              }
              {!post.metadata?.images &&
                <>
                  <header className="text-2xl line-clamp-2 text-slate-400 font-semibold truncate">{post.title}</header>
                  <ul className="list-inside list-decimal text-slate-400">
                    <li className="truncate text-slate-400 text-lg">{post.rank1}</li>
                    <li className="truncate text-slate-400 text-lg">{post.rank2}</li>
                    <li className="empty:hidden truncate text-slate-400 text-lg">{post.rank3}</li>
                    <li className="empty:hidden truncate text-slate-400 text-lg">{post.rank4}</li>
                    <li className="empty:hidden truncate text-slate-400 text-lg">{post.rank5}</li>
                  </ul>
                </>
              }
            </div>
          </div>
        </Link>
      ))}
      </div>
      <div ref={observerRef} className="h-[1px]" />
      {loading &&
        <header className="text-offwhite py-3">Loading more posts...</header>
      }
      {end && !loading &&
        <header className="text-offwhite py-3">No more posts to display!</header>
      }
    </>
  )
}