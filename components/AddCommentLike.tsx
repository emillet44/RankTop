'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react"
import { useRef, useState } from "react";
import { ChangeCommentLikes } from "./serverActions/changelikes";

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
        await ChangeCommentLikes(commentid, false, userid!);
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
        await ChangeCommentLikes(commentid, true, userid!);
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
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600/50">
            <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
              <button onClick={toggleModal} className="flex justify-self-end justify-center">
                <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
              </button>
              <h1 className="text-3xl justify-self-center pb-2 z-50">Sign in to like comments</h1>
              <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Sign In</button>
            </div>
          </div>
        }
      </>
    )
  }
}