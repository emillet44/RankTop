'use client'

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import useSWR from 'swr';
import Image from 'next/image';
import { fetchRerankImageMetadata } from './serverActions/findimage';

interface Item {
  text: string;
  note?: string | null;
  imageUrl?: string | null;
}

export function RerankCarousel({ items, rerankId, firstimage }: { items: Item[], rerankId: string, firstimage: boolean }) {
  const [index, setIndex] = useState(0);
  
  const fetcher = async () => {
    const { imageUrls } = await fetchRerankImageMetadata(rerankId);
    return imageUrls;
  };

  const { data: images, error } = useSWR(`rerank-images-${rerankId}`, fetcher);

  if (error) {
    return <div className="p-8 text-center text-red-400 bg-red-400/10 rounded-xl border border-red-400/20 text-sm">Error loading images</div>;
  }

  const changeImage = (e: any, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    if (direction === "left" && index > 0) {
      setIndex(index - 1);
    } 
    if (direction === "right" && items[index + 1] != null) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between px-4 pt-4 relative z-10">
        <span className="text-sm font-bold text-slate-400">
          #{index + 1} <span className="ml-1 font-medium text-slate-500 tracking-normal">{items[index]?.text}</span>
        </span>
        <div className="flex space-x-1">
          <button 
            onClick={(e) => changeImage(e, "left")} 
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-offwhite hover:bg-white/10 disabled:opacity-20 transition-all"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
          </button>
          <button 
            onClick={(e) => changeImage(e, "right")} 
            disabled={items[index + 1] == null}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-offwhite hover:bg-white/10 disabled:opacity-20 transition-all"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>
      </div>
      
      <div className="block relative aspect-video bg-black/40 overflow-hidden group/image">
        {!images ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images[index] ? (
          <Image 
            src={images[index]} 
            alt={`Rank ${index + 1}: ${items[index]?.text}`} 
            fill
            priority={firstimage && index === 0} 
            className="object-contain transition-transform duration-500 group-hover/image:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-medium tracking-normal capitalize">
            No image
          </div>
        )}
      </div>
    </div>
  )
}
