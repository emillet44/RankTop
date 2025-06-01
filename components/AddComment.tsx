'use client'

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react"
import { newComment, newReply } from "./serverActions/commentupload";
import { AddCommentLike } from "./AddCommentLike"
import Image from 'next/image'
import profilepic from '../pfp.png'
import { LoadBatch, LoadReplies } from "./serverActions/loadcomments";
import { faAngleDown, faAngleUp, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

//This function handles everything client side related to comments. Starting with state: comments stores an array of type Comment(defined by interface), modal toggles the sign in
//modal, loading stalls the intersection observer from loading more comments while they are being fetched, end is to display different text when all comments have been loaded(prevents
//extra fetch calls too), pause is for rl, replies stores an record of comments with the parent id as the index, openReplies stores the T/F state for all comments to determine whether
//to display replies for a comment or not(DOM manip used originally, however it's apparently not React if there isn't a trillion state variables), activeReplyInput is the same as the
//previous var, but for opening a reply input, batch determines how many comments have already been loaded, observerRef is for the observer to detect when the user has scrolled to the
//bottom of the comment list, observer is similar to observerRef(not exactly sure what it's for), commentInput is to store the value in the comment span, and replyInput stores the
//input in the specified reply span(only one open at a time). Now for functions, addComments is very similar to addPosts in PostList(used for batch loading), the useEffect hook contains
//the intersection observer, toggleModal is the sign in prompt, toggleReply opens the reply input, showReplies shows the replies for a comment, dateCalc is used for timestamps, 
//commentSubmit and replySubmit are self explanatory.

interface Comment {
  userliked: boolean;
  id: string;
  text: string;
  likes: number;
  date: Date;
  replies: number;
  username: string | null;
  postId: string;
  userId: string;
}

export function AddComment({ userid, postid, username }: { userid: string, postid: string, username: string | null | undefined }) {

  const [comments, setComments] = useState<Comment[]>([]);
  const [modalon, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [pause, setPause] = useState(false);
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({});
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null);

  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const commentInput = useRef<HTMLSpanElement>(null);
  const replyInput = useRef<HTMLSpanElement>(null);

  const addComments = async (type: string) => {
    try {
      setLoading(true);
      const newcomments: Comment[] = await LoadBatch(batch.current, type, userid, postid);
      if (newcomments.length > 0) {
        setComments(prevComments => [...prevComments, ...newcomments]);
        batch.current += 1;
      }
      else {
        setEnd(true);
      }
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !end) {
          //Change type later when sorting comments is implemented
          addComments("liked");
        }
      },
      { threshold: 0.1 }
    );

    observer.current = currentObserver;

    if (observerRef.current) {
      currentObserver.observe(observerRef.current);
    }

    return () => currentObserver.disconnect();
  }, [loading, end]);

  const toggleModal = () => setModal(!modalon);

  const toggleReply = (commentid: string) => {
    setActiveReplyInput(prevId => prevId === commentid ? null : commentid);
  }

  const showReplies = async (commentid: string) => {
    setOpenReplies(prev => ({ ...prev, [commentid]: !prev[commentid] }));
    if (!replies[commentid]) {
      try {
        const loadreplies: Comment[] = await LoadReplies(commentid, userid);
        setReplies(prev => ({ ...prev, [commentid]: loadreplies }));
      } catch (error) {
        console.error("Error loading replies:", error);
      }
    }
  }

  const dateCalc = (comdate: any) => {
    const now = new Date();
    const diff = now.getTime() - comdate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (diff / 1000 < 60) return "Seconds ago";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return comdate.toLocaleDateString('en-US', options);
  }

  const commentSubmit = async () => {
    if (userid && commentInput.current && commentInput.current.textContent?.trim() !== "") {
      const newCom = await newComment(userid, postid, username, commentInput.current.textContent!);
      setComments(prev => [newCom, ...prev]);
      commentInput.current.textContent = "";
    }
  }

  const replySubmit = async (commentid: string) => {

    if (replyInput.current && replyInput.current.textContent?.trim() !== "") {
      const newRep = await newReply(userid, postid, commentid, username, replyInput.current.textContent!);
      if (newRep) {
        setReplies(prev => ({
          ...prev,
          [commentid]: [newRep, ...(prev[commentid] || [])]
        }));
        replyInput.current.textContent = "";
        setOpenReplies(prev => ({ ...prev, [commentid]: true }));
        setActiveReplyInput(null);
      }
    }
  }

  const handlePause = () => {
    if (!pause) {
      setPause(true);
      setTimeout(() => setPause(false), 200);
    }
  }

  return (
    <div>
      <header className="text-3xl text-slate-400 justify-self-left">Comments</header>
      <div className="grid">
        {userid != "" &&
          <>
            <span ref={commentInput} contentEditable className="row-start-1 col-start-1 max-w-[672px] peer text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block" />
            <label className="row-start-1 col-start-1 peer-[&:not(:empty)]:invisible text-slate-400 pointer-events-none">Add a comment...</label>
            <button onClick={commentSubmit} className="flex justify-self-end max-w-min outline outline-2 outline-slate-700 rounded-md p-2 mt-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 peer-[&:empty]:hidden">Submit</button>
          </>
        }
        {userid == "" &&
          <>
            <span onClick={toggleModal} className="row-start-1 col-start-1 max-w-[672px] peer text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block" />
            <label className="row-start-1 col-start-1 peer-[&:not(:empty)]:invisible text-slate-400 pointer-events-none">Add a comment...</label>
          </>
        }
      </div>
      {modalon &&
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-slate-800 rounded-lg p-1 w-80 flex flex-col items-center">
            <div className="flex w-full justify-end">
              <button onClick={toggleModal}>
                <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
              </button>
            </div>
            <h2 className="text-2xl text-slate-300 font-bold text-center mb-4 px-4">Sign in to comment</h2>
            <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="my-2 w-72 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full">Sign In</button>
          </div>
        </div>
      }

      {comments.map((com) => (
        <div key={com.id} className="flex flex-col pt-3">
          <div className="flex flex-row gap-1 items-center">
            {com.username &&
                    <Link href={`/user/${com.username}`} className="items-center flex flex-row space-x-1 w-fit">
                      <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                      <header className="text-slate-400">{com.username}</header>
                    </Link>
                  }
                  {com.username === null &&
                    <div className="items-center flex flex-row space-x-1">
                      <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                      <header className="text-slate-400">Guest</header>
                    </div>
                  }
            <p key={com.id} className="text-md text-slate-400 before:content-['\00B7']">{" " + dateCalc(com.date)}</p>
          </div>
          <p className="text-slate-400">{com.text}</p>
          <div onClick={handlePause} className={`flex flex-row space-x-4 ${pause ? 'pointer-events-none' : ''}`}>
            <div className="flex space-x-1 items-center">
              <AddCommentLike commentid={com.id} postid={postid} userid={userid} likes={com.likes} isliked={com.userliked} />
            </div>
            {userid != "" &&
              <button onClick={() => toggleReply(com.id)} className="text-sm text-slate-400">Reply</button>
            }
            {userid == "" &&
              <button onClick={toggleModal} className="text-sm text-slate-400">Reply</button>
            }
          </div>
          {activeReplyInput === com.id &&
            <div className="grid grid-cols-2">
              <span ref={replyInput} contentEditable className="row-start-1 col-start-1 col-span-2 max-w-[672px] peer text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block" />
              <label className="row-start-1 col-start-1 col-span-2 peer-[&:not(:empty)]:invisible text-slate-400 pointer-events-none">Add a reply...</label>
              <button onClick={() => toggleReply(com.id)} className="row-start-2 col-start-2 flex justify-self-end mr-20 max-w-min outline outline-2 outline-slate-700 rounded-md p-2 mt-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Cancel</button>
              <button onClick={() => replySubmit(com.id)} className="row-start-2 col-start-2 flex justify-self-end max-w-min outline outline-2 outline-slate-700 rounded-md p-2 mt-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 peer-[&:empty]:disabled">Submit</button>
            </div>
          }
          {(replies[com.id]?.length > 0 || com.replies > 0) &&
            <button onClick={() => showReplies(com.id)} className="flex outline-none text-slate-400 self-start">
              {com.replies} Replies
              <FontAwesomeIcon icon={openReplies[com.id] ? faAngleUp : faAngleDown} style={{ color: "#94a3b8" }} className="mt-1.5 ml-1" />
            </button>
          }
          {openReplies[com.id] && replies[com.id] &&
            <div className="pl-6">
              {replies[com.id].map((reply) => (
                <div key={reply.id} className="flex flex-col pt-3">
                  <div className="flex flex-row gap-1 items-center">
                    {reply.username &&
                      <Link href={`/user/${reply.username}`} className="items-center flex flex-row space-x-1 w-fit">
                        <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                        <header className="text-slate-400">{reply.username}</header>
                      </Link>
                    }
                    {reply.username === null &&
                      <div className="items-center flex flex-row space-x-1">
                        <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                        <header className="text-slate-400">Guest</header>
                      </div>
                    }
                    <p key={reply.id} className="text-md text-slate-400 before:content-['\00B7']">{" " + dateCalc(reply.date)}</p>
                  </div>
                  <p className="text-slate-400">{reply.text}</p>
                  <div onClick={handlePause} className={`flex flex-row gap-4 ${pause ? 'pointer-events-none' : ''}`}>
                    <div className="flex space-x-1 items-center">
                      <AddCommentLike commentid={reply.id} postid={postid} userid={userid} likes={reply.likes} isliked={reply.userliked} />
                    </div>
                    {userid != "" &&
                      <button onClick={() => toggleReply(reply.id)} className="text-sm text-slate-400">Reply</button>
                    }
                    {userid == "" &&
                      <button onClick={toggleModal} className="text-sm text-slate-400">Reply</button>
                    }
                  </div>
                  {activeReplyInput === reply.id &&
                    <div className="grid grid-cols-2">
                      <span ref={replyInput} contentEditable className="row-start-1 col-start-1 col-span-2 max-w-[672px] peer text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block">@{reply.username}&nbsp;</span>
                      <label className="row-start-1 col-start-1 col-span-2 peer-[&:not(:empty)]:invisible text-slate-400 pointer-events-none">Add a reply...</label>
                      <button onClick={() => toggleReply(reply.id)} className="row-start-2 col-start-2 flex justify-self-end mr-20 max-w-min outline outline-2 outline-slate-700 rounded-md p-2 mt-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Cancel</button>
                      <button onClick={() => replySubmit(com.id)} className="row-start-2 col-start-2 flex justify-self-end max-w-min outline outline-2 outline-slate-700 rounded-md p-2 mt-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 peer-[&:empty]:hidden">Submit</button>
                    </div>
                  }
                </div>
              ))}
            </div>
          }
        </div>
      ))}
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