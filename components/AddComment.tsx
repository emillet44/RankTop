'use client'

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react"
import { newComment } from "./serverActions/commentupload";
import { AddCommentLike } from "./AddCommentLike"
import Image from 'next/image'
import profilepic from '../pfp.png'
import { LoadBatch } from "./serverActions/loadcomments";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//This function will be used to add comments to a post, however currently they are not stored anywhere and are only displayed client side for the user to see, until they refresh the
//page.

interface Comment {
  userliked: boolean;
  id: string;
  text: string;
  likes: number;
  date: Date;
  postId: string;
  userId: string;
}

export function AddComment({ userid, postid, username }: { userid: string, postid: string, username: string | null | undefined }) {

  const [submittedcoms, setSubmittedComs] = useState<Comment[]>([]);
  const [modalon, setModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [pause, setPause] = useState(false);
  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const addComments = async (type: string) => {
    try {
      const comments: Comment[] = await LoadBatch(batch.current, type, userid);
      if (comments) {
        setSubmittedComs([...submittedcoms, ...comments]);

        if (comments.length === 0) {
          setEnd(true);
        }
      }
      else {
        throw ("Comment couldn't be read.");
      }

    } catch (error) {
      console.error("Error loading more comments:", error);
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
          addComments("liked");
          batch.current += 1;
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

  const handleChange = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const toggleModal = () => {
    setModal(!modalon);
  }

  const dateCalc = (comdate: any) => {
    const now = new Date();
    let date: string;
    const diff = now.getTime() - comdate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (diff / 1000 < 60) {
      date = "Seconds ago";
    }
    else if (minutes < 60) {
      date = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    else if (hours < 24) {
      date = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      date = comdate.toLocaleDateString('en-US', options);
    }
    return date;
  }

  const subHandler = async () => {
    if (textareaRef.current && userid) {
      if (textareaRef.current.value.trim() !== "") {
        const newcom = await newComment(userid, postid, username, textareaRef.current.value);

        setSubmittedComs([newcom, ...submittedcoms]);
        textareaRef.current.value = "";
      }
    }
  }

  const test = () => {
    if(!pause) {
      setPause(true);
      setTimeout(() => {
        setPause(false);
      }, 200);
    }
  }

  return (
    <div>
      <header className="text-3xl text-slate-400 justify-self-left">Comments</header>
      <div className="flex flex-col space-y-2">
        {userid != "" &&
          <>
            <textarea rows={1} ref={textareaRef} onChange={handleChange} id="comment" placeholder="Add a comment..." className="bg-transparent peer text-xl text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block row-start-1 col-start-1 peer resize-none overflow-hidden" />
            <button onClick={subHandler} className="self-end outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 peer-placeholder-shown:hidden">Submit</button>
          </>
        }
        {userid == "" &&
          <textarea rows={1} onFocus={toggleModal} readOnly placeholder="Add a comment..." className="bg-transparent peer text-xl text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block row-start-1 col-start-1 peer resize-none overflow-hidden" />
        }
      </div>
      {modalon &&
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600/50">
          <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
            <button onClick={toggleModal} className="flex justify-self-end justify-center">
              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
            </button>
            <h1 className="text-3xl justify-self-center pb-2 z-50">Sign in to post comments</h1>
            <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Sign In</button>
          </div>
        </div>
      }
      {submittedcoms.length !== 0 &&
        <>
          {submittedcoms.map((com) => (
            <div key={com.id} className="flex flex-col pt-3">
              <div className="flex flex-row gap-1 items-center">
                <div className="items-center flex flex-row space-x-1">
                  <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                  <header className="text-slate-400">{username || "Guest"}</header>
                </div>
                <p key={com.id} className="text-md text-slate-400 before:content-['\00B7']">{" " + dateCalc(com.date)}</p>
              </div>
              <p className="text-xl text-slate-400">{com.text}</p>
              <div onClick={test} className={`flex flex-row gap-2 ${pause ? 'pointer-events-none' : ''}`}>
                <AddCommentLike commentid={com.id} postid={postid} userid={userid} likes={com.likes} isliked={com.userliked} />
                <button className="text-sm text-slate-400">Reply</button>
              </div>
            </div>
          ))}
        </>
      }
      <div ref={observerRef} className="h-[1px]" />
      {loading &&
        <header className="text-offwhite pt-3">Loading more comments...</header>
      }
      {end && !loading &&
        <header className="text-offwhite pt-3">No more comments to display!</header>
      }
    </div>
  )
}