'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react"
import { useState } from "react";
import { ChangeLikes } from "./serverActions/changelikes";
import { Likes } from "./serverActions/changelikes";
import useSWR from "swr";

let states: any[];

//By far the most complex component of the whole site. The function starts by initializing state variables, and then it uses the useSWR hook to fetch data from the Likes
//function under /serverActions/changelikes. useSWR is required as server actions cannot be called by client components in Nextjs. With the useSWR data, the states array
//is populated. If the states array has been populated, if states[0](user email) exists, and it's the first render, the component will render using data from useSWR. If
//the states array has been populated, and it's not the first render, the component will render using data from the liked hook. If states[0](user email) does not exist,
//the component will render with a modal prompt enforcing that the user signs in before liking a post. If the like button is clicked on the first render, it will update
//the "liked" state variable(this variable cannot be trusted on the first render because it must have a static value on the first render, hence why the useSWR data is used
//on the first render), and perform a lot of toggling states. "like" will either be set to 1 or 0, count will increment(to rate limit the button to only 6 clicks before a 
//page refresh is necessary), "liked" will be set to the opposite of the useSWR data, and all relevant like data will be updated on the database. States[2] remains in use 
//as a conditional even after the first render, because the "liked" state variable only updates by the next render of the component(standard functionality of React state
//variables). Modalon is the state variable that controls the rendering of the sign in modal. Two icons are also loaded from Fontawesome, one for an unliked post, and 
//one for a liked post. isValidating is also another handy variable from useSWR, used to show "...", loading dots, whenever useSWR is revalidating the like data. States 
//this component can handle: 1.User is not signed in and tries to like a post. 2.User is signed in and refreshes the page. 3.User had previously liked the post and revisits
//the post 4.User likes/unlikes a post, leaves the post, and revisits the post before the server cache is updated 5.User tries to lag the site by spamming like button 
export function AddLike(props: any) {

  const [liked, setLiked] = useState(false);
  const [firstrender, setFirstRender] = useState(true);
  const [count, addCount] = useState(0);
  const [like, setLike] = useState(0);
  const [modalon, setModal] = useState(false);

  const postId = props.postId;

  const fetcher = (postId: string) => Likes(postId);
  const { data, isValidating } = useSWR(postId, fetcher, {
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
      setLiked(states[2]);
    }
    if (count < 6) {
      if (!states[2]) {
        setLiked(true);
        setLike(like + 1);
        addCount(count + 1);
        ChangeLikes(postId, true, states[1]);
        states[2] = true;
      }
      else {
        setLiked(false);
        setLike(like - 1);
        addCount(count + 1);
        ChangeLikes(postId, false, states[1]);
        states[2] = false;
      }
    }
  }

  if (states) {
    if (firstrender && states[0]) {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleLike}>
            {!states[2] && !isValidating &&
              <FontAwesomeIcon icon={faHeart} className="w-9 h-9" style={{color: "#334155",}} />
            }
            {states[2] && !isValidating &&
              <FontAwesomeIcon icon={faHeartSolid} className="w-9 h-9" style={{color: "#334155",}} />
            }
            {isValidating &&
              <header className="w-40 pt-2 text-lg">...</header>
            }
          </button>
          {!isValidating &&
            <header className="pt-0.5 text-2xl text-slate-400">{states[3] + like}</header>
          }
          
        </>
      )
    }
    else if (!firstrender) {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleLike}>
            {!liked ? 
              <FontAwesomeIcon icon={faHeart} className="w-9 h-9" style={{color: "#334155",}} />
              :
              <FontAwesomeIcon icon={faHeartSolid} className="w-9 h-9" style={{color: "#334155",}} />
            }
          </button>
          <header className="pt-0.5 text-2xl text-slate-400">{states[3] + like}</header>
        </>
      )
    }
    else {
      return (
        <>
          <button className="flex justify-self-left w-9 h-9" onClick={toggleModal}>
            <FontAwesomeIcon icon={faHeart} className="w-9 h-9" style={{color: "#334155",}} />
          </button>
          <header className="pt-0.5 text-2xl text-slate-400">{states[3] + like}</header>
          {modalon &&
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600/50">
              <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
                <button onClick={toggleModal} className="flex justify-self-end justify-center">
                  <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                </button>
                <h1 className="text-3xl justify-self-center pb-2 z-50">Sign in to like posts</h1>
                <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postId}` })} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Sign In</button>
              </div>
            </div>
          }
        </>
      )
    }
  }
}