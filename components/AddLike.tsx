'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react"
import { useState } from "react";
import { ChangeLikes } from "./FindLikes";
import { Likes } from "@/components/signinstate";
import useSWR from "swr";

let states: any[];

export function AddLike(props: any) {

  const [liked, setLiked] = useState(false);
  const [firstrender, setFirstRender] = useState(true);
  const [count, addCount] = useState(0);
  const [like, setLike] = useState(0);
  const [modalon, setModal] = useState(false);

  const postid = props.postid;

  const fetcher = (postid: string) => Likes(postid);
  const { data, isValidating } = useSWR(postid, fetcher, {
    revalidateOnFocus: false
  });

  if (data !== undefined) {
    states = data;
  }

  const toggleModal = () => {
    setModal(!modalon);
  }

  const toggleLike = () => {

    if (firstrender) {
      setFirstRender(false);
      setLiked(states[5]);
    }
    if (count < 6) {
      if (!states[5]) {
        setLiked(true);
        setLike(like + 1);
        addCount(count + 1);
        ChangeLikes(postid, true, states[4]);
        states[5] = true;
      }
      else {
        setLiked(false);
        setLike(like - 1);
        addCount(count + 1);
        ChangeLikes(postid, false, states[4]);
        states[5] = false;
      }
    }
  }

  if (states) {
    if (firstrender && states[3]) {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleLike}>
            {!states[5] && !isValidating &&
              <FontAwesomeIcon icon={faHeart} className="w-9 h-9" />
            }
            {states[5] && !isValidating &&
              <FontAwesomeIcon icon={faHeartSolid} className="w-9 h-9" />
            }
            {isValidating &&
              <header className="w-40 pt-2 text-lg">...</header>
            }
          </button>
          {!isValidating &&
            <header className="w-40 pt-2 text-lg">{states[6] + like} Likes</header>
          }
          
        </>
      )
    }
    else if (!firstrender) {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleLike}>
            {!liked &&
              <FontAwesomeIcon icon={faHeart} className="w-9 h-9" />
            }
            {liked &&
              <FontAwesomeIcon icon={faHeartSolid} className="w-9 h-9" />
            }
          </button>
          <header className="w-40 pt-2 text-lg">{states[6] + like} Likes</header>
        </>
      )
    }
    else {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleModal}>
            <FontAwesomeIcon icon={faHeart} className="w-9 h-9" />
          </button>
          <header className="w-40 pt-2 text-lg">{states[6] + like} Likes</header>
          {modalon &&
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600/50">
              <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
                <button onClick={toggleModal} className="flex justify-self-end justify-center">
                  <FontAwesomeIcon className="w-6 h-6" icon={faCircleXmark} />
                </button>
                <h1 className="text-3xl justify-self-center pb-2">Sign in to like posts</h1>
                <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Sign In</button>
              </div>
            </div>
          }
        </>
      )
    }
  }
}