'use client'

import { useRef, useState } from "react";
import { addFollow, removeFollow } from "./serverActions/changefollow";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";

export function AddFollow({ following, profileid, userid, username, followerCount, followingCount }: { following: boolean, profileid: string, userid: string, username: string, followerCount: number, followingCount: number }) {

  const count = useRef(0);
  const [followed, setFollowed] = useState(following);
  const [quickfollow, setQuickFollow] = useState(0);
  const [modalon, setModal] = useState(false);
  const [pause, setPause] = useState(false);

  const toggleModal = () => {
    setModal(!modalon);
  }

  const toggleFollow = async () => {
    if (pause) {
      return;
    }
    count.current = count.current + 1;
    setPause(true);

    if (count.current <= 6) {
      if (followed) {
        setFollowed(false);
        setQuickFollow(quickfollow - 1);
        await removeFollow(profileid, userid);
      }
      else {
        setFollowed(true);
        setQuickFollow(quickfollow + 1);
        await addFollow(profileid, userid);
      }
    }

    setTimeout(() => {
      setPause(false);
    }, 1000);
  }

  if (userid) {
    return (
      <>
        <div className="flex flex-col">
          <h1 className="text-4xl text-offwhite">{username}</h1>
          <div className="flex flex-row space-x-4">
            <h2 className="text-sm text-slate-400 mt-1">{followerCount + quickfollow} Followers</h2>
            <h2 className="text-sm text-slate-400 mt-1">{followingCount} Following</h2>
          </div>
        </div>

        {!(profileid === userid) &&
          <>
            {!followed &&
              <button onClick={toggleFollow} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 ml-4 mt-4">Follow</button>
            }
            {followed &&
              <button onClick={toggleFollow} className="outline outline-2 outline-slate-700 rounded-md py-2 bg-slate-50 hover:bg-opacity-20 hover:bg-red-600 w-[84px] bg-opacity-5 text-slate-400 ml-4 mt-4 group">
                <header className="group-hover:hidden text-slate-400">Following</header>
                <header className="hidden group-hover:block text-slate-400">Unfollow?</header>
              </button>
            }
          </>
        }
      </>
    )
  }
  else {
    return (
      <>
        <button onClick={toggleModal} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 ml-4 mt-4">Follow</button>
        {modalon &&
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-slate-800 rounded-lg p-1 w-80 flex flex-col items-center">
              <div className="flex w-full justify-end">
                <button onClick={toggleModal}>
                  <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                </button> 
              </div>
              <h2 className="text-slate-300 text-2xl font-bold text-center mb-4 px-4">Sign in to follow users</h2>
              <button onClick={() => signIn(undefined, { callbackUrl: `/user/${username}` })} className="my-2 w-72 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full">Sign In</button>
            </div>
          </div>
        }
      </>
    )
  }
}