'use client'

import { useRef, useState } from "react";
import { signIn } from "next-auth/react"
import { newComment } from "./serverActions/commentupload";
import Image from 'next/image'
import profilepic from '../pfp.png'

//This function will be used to add comments to a post, however currently they are not stored anywhere and are only displayed client side for the user to see, until they refresh the
//page.

interface Comment {
  id: string;
  text: string;
  likes: number;
  date: Date;
  postId: string;
  userId: string;
}

export function AddComment({ userid, postid, username, comments }: { userid: string | null, postid: string, username: string | null | undefined, comments: Comment[] }) {

  const [submittedcoms, setSubmittedComs] = useState<Comment[]>(comments);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const dateCalc = (comdate: Date) => {
    const now = new Date();
    let date: string;
    const diff = now.getTime() - comdate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 1440000);
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

  return (
    <div>
      <header className="text-3xl text-slate-400 justify-self-left">Comments</header>
      {userid !== null &&
        <div className="flex flex-col space-y-2">
          <textarea rows={1} ref={textareaRef} onChange={handleChange} id="comment" placeholder="Add a comment..." className="bg-transparent peer text-xl text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block row-start-1 col-start-1 peer resize-none overflow-hidden" />
          <button onClick={subHandler} className="self-end outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 peer-placeholder-shown:hidden">Submit</button>
        </div>
      }

      {submittedcoms.map((com) => (
        <div key={com.id} className="flex flex-col pt-2">
          <div className="flex flex-row gap-1 items-center">
            <div className="items-center flex flex-row space-x-1">
              <Image src={profilepic} alt={"pfp"} width={30} height={30} />
              <header className="text-slate-400">{username || "Guest"}</header>
            </div>
            <p key={com.id} className="text-md text-slate-400 before:content-['\00B7']">{" " + dateCalc(com.date)}</p>
          </div>
          <p className="text-xl text-slate-400">{com.text}</p>
          <div className="flex flex-row gap-2">
            <button className="text-sm text-slate-400">Reply</button>
          </div>
        </div>
      ))}
    </div>
  )
}