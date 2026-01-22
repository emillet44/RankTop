'use client'

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface VideoDisplayProps {
  videoUrl: string;
  title: string;
  postId: string;
  variant?: 'full' | 'preview';
}

export function VideoDisplay({
  videoUrl,
  title,
  postId,
  variant = 'full'
}: VideoDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [posterError, setPosterError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const posterUrl = `https://storage.googleapis.com/ranktop-v-thumb/${postId}.jpg`;

  // Fallback if the video fails or metadata is already there
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full">
      {title && variant === 'preview' && (
        <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">
          {title}
        </header>
      )}
      
      <div className={`grid auto-rows-auto items-center ${
        variant === 'full' ? 'grid-cols-1 justify-items-center' : 'grid-cols-[auto,11fr,auto]'
      }`}>
        {variant === 'preview' && <div className="w-8" />}

        <div className={`relative rounded-xl overflow-hidden outline outline-slate-700 bg-black ${
          variant === 'full' ? 'w-full aspect-video' : 'h-[341px]'
        }`}>
          
          {isLoading && (
            <div className="absolute inset-0 bg-slate-800/50 animate-pulse flex items-center justify-center z-10">
              <div className="text-slate-400 text-sm">Loading video...</div>
            </div>
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            // If the poster fails to load, we don't want a broken icon
            poster={posterError ? undefined : posterUrl}
            controls
            playsInline
            preload={variant === 'preview' ? 'metadata' : 'auto'}
            // crossOrigin is vital for the poster to work with GCS CORS
            crossOrigin="anonymous"
            className="w-full h-full object-contain"
            onLoadedData={() => setIsLoading(false)}
            onLoadedMetadata={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          >
            {/* Hidden img tag to catch poster load errors */}
            <Image 
              src={posterUrl} 
              onError={() => setPosterError(true)} 
              style={{ display: 'none' }} 
              alt=""
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {variant === 'preview' && <div className="w-8" />}
      </div>
    </div>
  );
}