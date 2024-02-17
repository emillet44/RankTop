'use client'

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useState } from "react";
import Image from 'next/image'

interface Prop {
  ranks: (string | null)[];
  postid: string;
}

const ListCarousel: FC<Prop> = ({ ranks, postid }) => {

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
      <div className="pt-8 pb-8 rounded-xl outline outline-slate-700">
        <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">{ranks[index]}</header>

        <div className="grid grid-flow-col items-center">
          <div className="w-8">
            {index > 0 &&
              < button onClick={(e) => changeImage(e, "left")} className="w-8 h-8">
                <FontAwesomeIcon icon={faChevronLeft} size="2xl" style={{color: '#fffff0'}} className="pl-0.5" />
              </button>
            }
          </div>

          {index == 0 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "1.png"} alt="Image 1" width={1920} height={1080}></Image>
          }
          {index == 1 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "2.png"} alt="Image 2" width={1920} height={1080}></Image>
          }
          {index == 2 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "3.png"} alt="Image 3" width={1920} height={1080}></Image>
          }
          {index == 3 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "4.png"} alt="Image 4" width={1920} height={1080}></Image>
          }
          {index == 4 &&
            <Image src={"https://storage.googleapis.com/ranktop-i/" + postid + "5.png"} alt="Image 5" width={1920} height={1080}></Image>
          }

          <div className="w-8">
            {ranks[index + 1] != null &&
              <button onClick={(e) => changeImage(e, "right")} className="w-8 h-8">
                <FontAwesomeIcon icon={faChevronRight} size="2xl" style={{color: '#fffff0'}} className="pr-0.5" />
              </button>
            }
          </div>


        </div>

      </div >

    </>
  )
}
export default ListCarousel;