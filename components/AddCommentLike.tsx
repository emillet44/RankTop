'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react"
import { useRef, useState } from "react";
import { addCommentLike, removeCommentLike } from "./serverActions/changelikes";

//Almost the same as AddLike but with a method to prevent errors from simultaneous database updates

export function AddCommentLike({ commentid, postid, userid, likes, isliked }: { commentid: string, postid: string, userid: string, likes: number, isliked: boolean }) {

  const [liked, setLiked] = useState(isliked);
  const reallike = useRef(isliked);
  const [quicklike, setQuickLike] = useState(0);
  const [modalon, setModal] = useState(false);
  const pause = useRef(false);

  const toggleModal = () => {
    setModal(!modalon);
  }

  const toggleLike = async () => {

    if (liked) {
      setLiked(false);
      setQuickLike(quicklike - 1);
      if (!pause.current && reallike.current == true) {
        pause.current = true;
        await removeCommentLike(commentid, userid!);
        reallike.current = false;

        setTimeout(() => {
          pause.current = false;
        }, 5000);
      }
    }
    else {
      setLiked(true);
      setQuickLike(quicklike + 1);
      if (!pause.current && reallike.current == false) {
        pause.current = true;
        await addCommentLike(commentid, userid!);
        reallike.current = true;

        setTimeout(() => {
          pause.current = false;
        }, 5000);
      }
    }
  };

  if (userid != "") {
    return (
      <>
        <button className="flex justify-self-left w-6 h-6" onClick={toggleLike}>
          {!liked &&
            <FontAwesomeIcon icon={faHeart} className="w-6 h-6" style={{ color: "#334155", }} />
          }
          {liked &&
            <FontAwesomeIcon icon={faHeartSolid} className="w-6 h-6" style={{ color: "#334155", }} />
          }
        </button>
        <header className="pt-0.5 text-slate-400">{likes + quicklike}</header>
      </>
    )
  }
  else {
    return (
      <>
        <button className="flex justify-self-left w-6 h-6" onClick={toggleModal}>
          <FontAwesomeIcon icon={faHeart} className="w-6 h-6" style={{ color: "#334155", }} />
        </button>
        <header className="pt-0.5 text-xl text-slate-400">{likes}</header>
        {modalon &&
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-slate-800 rounded-lg p-1 w-80 flex flex-col items-center">
              <div className="flex w-full justify-end">
                <button onClick={toggleModal}>
                  <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                </button>
              </div>
              <h2 className="text-2xl text-slate-300 font-bold text-center mb-4 px-4">Sign in to like comments</h2>
              <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="my-2 w-72 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full">Sign In</button>
            </div>
          </div>
        }
      </>
    )
  }
}