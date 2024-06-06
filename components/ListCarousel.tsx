'use client'

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Image from 'next/image';

//This function contains all the images of a post and cycles through them when the left/right chevrons are clicked. The index variable is used to display the proper post after a 
//chevron is clicked. As for accessing the images, they are loaded from a Google Cloud bucket using a custom url with the post id and rank number.

export function ListCarousel({ ranks, postid }: { ranks: (string | null)[], postid: string }) {

  const [index, setIndex] = useState(0);

  const changeImage = (e: any, lr: string) => {
    e.preventDefault();
    if (lr == "left") {
      setIndex(index - 1);
    }
    else {
      setIndex(index + 1);
    }
  };

  return (
    <>
      <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">{ranks[index]}</header>
      <div className="grid grid-cols-[auto,11fr,auto] auto-rows-auto items-center">
        <div className="w-8">
          {index > 0 &&
            < button onClick={(e) => changeImage(e, "left")} className="w-8 h-8">
              <FontAwesomeIcon icon={faChevronLeft} size="2xl" style={{ color: '#fffff0' }} className="pl-0.5" />
            </button>
          }
        </div>
        <div className="relative h-[342px] bg-black rounded-xl">
          {index == 0 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "1.png"} alt="Image 1" fill={true} className="object-contain h-full"></Image>
          }
          {index == 1 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "2.png"} alt="Image 2" fill={true} className="object-contain h-full"></Image>
          }
          {index == 2 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "3.png"} alt="Image 3" fill={true}></Image>
          }
          {index == 3 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "4.png"} alt="Image 4" fill={true}></Image>
          }
          {index == 4 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "5.png"} alt="Image 5" fill={true}></Image>
          }
        </div>
        <div className="w-8">
          {ranks[index + 1] != null &&
            <button onClick={(e) => changeImage(e, "right")} className="w-8 h-8">
              <FontAwesomeIcon icon={faChevronRight} size="2xl" style={{ color: '#fffff0' }} className="pr-0.5" />
            </button>
          }
        </div>
      </div>
    </>
  )
}