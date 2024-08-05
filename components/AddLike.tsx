'use client'

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react"
import { useRef, useState } from "react";
import { ChangeLikes } from "./serverActions/changelikes";

//The function starts by initializing state variables, and then it uses the useSWR hook to fetch data from the Likes function under /serverActions/changelikes. useSWR is required 
//as server actions cannot be called by client components in Nextjs. With the useSWR data, the states array is populated. If the states array has been populated, if 
//states[0](user email) exists, and it's the first render, the component will render using data from useSWR. If the states array has been populated, and it's not the first render, 
//the component will render using data from the liked hook. If states[0](user email) does not exist, the component will render with a modal prompt enforcing that the user signs in 
//before liking a post. If the like button is clicked on the first render, it will update the "liked" state variable(this variable cannot be trusted on the first render because it 
//must have a static value on the first render, hence why the useSWR data is used on the first render), and perform a lot of toggling states. "like" will either be set to 1 or 0, 
//count will increment(to rate limit the button to only 6 clicks before a page refresh is necessary), "liked" will be set to the opposite of the useSWR data, and all relevant like 
//data will be updated on the database. States[2] remains in use as a conditional even after the first render, because the "liked" state variable only updates by the next render of 
//the component(standard functionality of React state variables). Modalon is the state variable that controls the rendering of the sign in modal. Two icons are also loaded from 
//Fontawesome, one for an unliked post, and one for a liked post. isValidating is also another handy variable from useSWR, used to show "...", loading dots, whenever useSWR is 
//revalidating the like data. States this component can handle: 1.User is not signed in and tries to like a post. 2.User is signed in and refreshes the page. 3.User had previously 
//liked the post and revisits the post 4.User likes/unlikes a post, leaves the post, and revisits the post before the server cache is updated 5.User tries to lag the site by spamming 
//like button.
//To add some clarity on how the whole server/client thing works, bc this guy ^ is dumb and doesn't know what he's talking about: There are three types of components in NextJS. Server
//actions/functions, server components, and client components. NextJS states that you cannot call a server action on the first render, as it will create a fetch waterfall(not sure how
//but it do). Async + server actions are used in some areas of this project within a client component because it's AFTER the first render. 
//Turns out I could've used prop drilling here the whole time, so I just fixed this component and made it drastically shorter. Plus a new throttle on the speed at which users can spam
//the button set to 1 second, plus no extra delay from useSWR. Plus 2 people can like the same post now, because that was completely screwed up before(replaced unique identifier from
//postid to joint postid + userid).

export function AddLike({ postid, likes, userliked, userid }: { postid: string, likes: number, userliked: boolean, userid: string | null }) {

  const count = useRef(0);
  const [liked, setLiked] = useState(userliked);
  const [quicklike, setQuickLike] = useState(0);
  const [modalon, setModal] = useState(false);
  const [pause, setPause] = useState(false);

  const toggleModal = () => {
    setModal(!modalon);
  }

  const toggleLike = async () => {
    if (pause) {
      return;
    }
    count.current = count.current + 1;
    setPause(true);

    if (count.current <= 6) {
      if (liked) {
        setLiked(false);
        setQuickLike(quicklike - 1);
        await ChangeLikes(postid, false, userid!);
      }
      else {
        setLiked(true);
        setQuickLike(quicklike + 1);
        await ChangeLikes(postid, true, userid!);
      }
    }

    setTimeout(() => {
      setPause(false);
    }, 1000);
  };

  if (userid) {
    return (
      <>
        <button className="flex justify-self-left w-7 h-7" onClick={toggleLike}>
          {!liked &&
            <FontAwesomeIcon icon={faHeart} className="w-7 h-7" style={{ color: "#334155", }} />
          }
          {liked &&
            <FontAwesomeIcon icon={faHeartSolid} className="w-7 h-7" style={{ color: "#334155", }} />
          }
        </button>
        <header className="pt-0.5 text-xl text-slate-400">{likes + quicklike}</header>
      </>
    )
  }
  else {
    return (
      <>
        <button className="flex justify-self-left w-7 h-7" onClick={toggleModal}>
          <FontAwesomeIcon icon={faHeart} className="w-7 h-7" style={{ color: "#334155", }} />
        </button>
        <header className="pt-0.5 text-xl text-slate-400">{likes}</header>
        {modalon &&
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-end">
                <button onClick={toggleModal}>
                  <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Sign in to like posts</h2>
              <button onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-300">Sign In</button>
            </div>
          </div>
        }
      </>
    )
  }
}