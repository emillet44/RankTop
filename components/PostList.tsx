'use client'

import Link from "next/link"
import { ListCarousel } from "./ListCarousel"
import { useEffect, useRef, useState } from "react";
import { LoadBatch, LoadBatchCat } from "./serverActions/loadposts";

//This function is pure wizardry to me, but in general, there's a few key things happening. First, posts is loaded with the prop data from the main homepage, or the first batch.
//Batch keeps track of how many posts the user has scrolled through, loading prevents the loadposts server action from being called repeatedly and also serves as an indicator for
//the user, end determines if there are no more posts to load, observerRef is the element that the observer refers to when it checks if it is within or near the viewport, and observer
//is the magic API that automatically triggers the function when the reference element is near to the viewport. The addposts function is what handles updating the posts state variable
//using the spread operator to merge the old posts and new posts, and if there are no posts being sent back by LoadAll then the end of the post type has been reached. When finished it
//updates loading to false to allow more loads. The useEffect hook is used to kill the observer whenever the component unmounts, new posts are loading, or the end is reached. Within 
//it, roughly what it's doing is managing the observer/observerRef to watch for intersection with a 0.1 threshold(large threshold, 1 is smallest, where threshold describes how close
//the element has to be to the viewport to trigger a load). 
//Posts are now sorted by categories, hence the extra state variables lockcat and category. When the category is changed, batch 0 of that category is loaded from loadposts, by 
//resetting the post list, batch, and end variables. If the category is custom, a load will not be triggered until the user enters a custom category name within the input(might be 
//very hard but implementing the Algolia instant search here would be incredibly useful to make custom categories viable, as currently there's no way to know what custom categories 
//are out there or what ones are popular). 'c' is added to any custom category string, as it's used as an indicator to determine whether to search for the exact category or something
//similar to the category within loadposts. It's better for now to look for something similar when using custom, because it allows users to find custom communities easier(wont matter
//once Algolia search is used, it already does that). Posts can also be sorted by views and likes within a certain time frame, which is possible by layering the intersection observer
//with more conditions(the value of sort), adding a separate function and server action to handle sorts other than category, and ensuring posts are reset on any change of the select 
//filters.

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
              {list.metadata?.images &&
                <div className="py-8 sm:border-x border-b border-slate-700">
                  <header className="pl-8 text-4xl line-clamp-2 text-slate-400 font-semibold">{list.title}</header>
                  <ListCarousel ranks={[list.rank1, list.rank2, list.rank3, list.rank4, list.rank5]} postid={list.id} firstimage={index === 0} />
                </div>
              }
              {!list.metadata?.images &&
                <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 border-x border-b border-slate-700">
                  <header className="text-4xl line-clamp-2 text-slate-400 font-semibold">{list.title}</header>
                  <li className="truncate text-xl text-slate-400">{list.rank1}</li>
                  <li className="truncate text-xl text-slate-400">{list.rank2}</li>
                  <li className="empty:hidden truncate text-xl text-slate-400">{list.rank3}</li>
                  <li className="empty:hidden truncate text-xl text-slate-400">{list.rank4}</li>
                  <li className="empty:hidden truncate text-xl text-slate-400">{list.rank5}</li>
                </ul>
              }
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