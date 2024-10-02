'use client'

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import useSWR from 'swr';
import Image from 'next/image';
import { fetchImageMetadata } from './serverActions/findimage';

//Component that renders images for posts. 

export function ListCarousel({ ranks, postid, firstimage }: { ranks: (string | null)[], postid: string, firstimage: boolean }) {
  const [index, setIndex] = useState(0);
  
  
  const fetcher = async () => {
    const { imageUrls } = await fetchImageMetadata(postid);
    return imageUrls;
  };

  const { data: images, error } = useSWR(`/api/imageMetadata/${postid}`, fetcher);

  if (error) {
    console.error('Error fetching image metadata:', error);
    return <div>Error loading images</div>;
  }

  const changeImage = (e: any, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(prevIndex => {
      if (direction === "left") {
        prevIndex -= 1;
      } 
      if (direction === "right") {
        prevIndex += 1;
      }
      return prevIndex;
    });
  };

  return (
    <>
      <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">{ranks[index]}</header>
      <div className="grid grid-cols-[auto,11fr,auto] auto-rows-auto items-center">
        <button onClick={(e) => changeImage(e, "left")} className="w-8 h-8" disabled={index === 0}>
          <FontAwesomeIcon icon={faChevronLeft} size="2xl" style={{ color: index === 0 ? '#4a5568' : '#fffff0' }} className="pl-0.5"/>
        </button>
        <div className="relative h-[341px] bg-black rounded-xl">
          {images && images[index] &&
            <Image src={images[index]} alt={`Image ${index + 1}`} width={1920} height={1080} priority={firstimage && index === 0} className="object-contain h-full rounded-md"/>
          }
        </div>
        <button onClick={(e) => changeImage(e, "right")} className="w-8 h-8" disabled={ranks[index + 1] == null}>
          <FontAwesomeIcon icon={faChevronRight} size="2xl" style={{ color: ranks[index + 1] == null ? '#4a5568' : '#fffff0' }} className="pr-0.5"/>
        </button>
      </div>
    </>
  )
}