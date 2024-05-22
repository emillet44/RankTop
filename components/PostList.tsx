'use client'

import Link from "next/link"
import { ListCarousel } from "./ListCarousel"
import { useEffect, useRef, useState } from "react";
import { LoadBatch } from "./serverActions/loadposts";

//This function is pure wizardry to me, but in general, there's a few key things happening. First, posts is loaded with the prop data from the main homepage, or the first batch.
//Batch keeps track of how many posts the user has scrolled through, loading prevents the loadposts server action from being called repeatedly and also serves as an indicator for
//the user, end determines if there are no more posts to load, observerRef is the element that the observer refers to when it checks if it is within or near the viewport, and observer
//is the magic API that automatically triggers the function when the reference element is near to the viewport. The addposts function is what handles updating the posts state variable
//using the spread operator to merge the old posts and new posts, and if there are no posts being sent back by LoadAll then the end of the post type has been reached. When finished it
//updates loading to false to allow more loads. The useEffect hook is used to kill the observer whenever the component unmounts, new posts are loading, or the end is reached. Within 
//it, roughly what it's doing is managing the observer/observerRef to watch for intersection with a 0.1 threshold(large threshold, 1 is smallest, where threshold describes how close
//the element has to be to the viewport to trigger a load).

export default function PostsList({ starter }: { starter: any }) {

  const [posts, setPosts] = useState(starter);
  const [batch, setBatch] = useState(1);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const addPosts = async () => {
    try {
      const posts = await LoadBatch(batch);
      if (posts.length > 0) {
        setPosts((prevPosts: any) => [...prevPosts, ...posts]);
      }
      else {
        setEnd(true);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !end) {
          setLoading(true);
          setBatch(prevBatch => prevBatch + 1);
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
      {posts?.map((list: any) => (
        <Link href={`/post/${list.id}`} className="w-full" key={list.id}>
          {list.metadata?.images &&
            <div className="pt-8 pb-8 border-x border-b border-slate-700">
              <ListCarousel title={list.title} ranks={[list.rank1, list.rank2, list.rank3, list.rank4, list.rank5]} postid={list.id} />
            </div>
          }
          {!list.metadata?.images &&
            <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 border-x border-b border-slate-700">
              <header className="capitalize text-4xl line-clamp-2 text-slate-400 font-semibold">{list.title}</header>
              <li className="capitalize truncate text-xl text-slate-400">{list.rank1}</li>
              <li className="capitalize truncate text-xl text-slate-400">{list.rank2}</li>
              <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank3}</li>
              <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank4}</li>
              <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank5}</li>
            </ul>
          }
        </Link>
      ))}
      <div ref={observerRef} style={{ height: '1px' }}></div>
      {loading && 
      <header className="text-offwhite">Loading more posts...</header>
      }
      {end && 
      <header className="text-offwhite">No more posts to display!</header>
      }
    </>
  )
}