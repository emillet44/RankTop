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
  
  // New State for Retry Logic
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const posterUrl = `https://storage.googleapis.com/ranktop-v-thumb/${postId}.jpg`;

  // 1. Smart Retry Effect
  // If the video errors (404), wait 1s and try again with a new timestamp
  useEffect(() => {
    if (videoError && retryCount < 10) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          // Append timestamp to URL to bypass browser/CDN cache of the 404
          const currentSrc = videoRef.current.src.split('?')[0];
          videoRef.current.src = `${currentSrc}?t=${Date.now()}`;
          videoRef.current.load();
        }
        setRetryCount(prev => prev + 1);
        setVideoError(false); // Reset error trigger
        setIsLoading(true);   // Show loading spinner again
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [videoError, retryCount]);

  // 2. Initial Mount Check
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="relative bg-black/40 aspect-video overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    {retryCount > 0 ? 'Syncing...' : 'Loading...'}
                </div>
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterError ? undefined : posterUrl}
          controls
          playsInline
          preload={variant === 'preview' ? 'metadata' : 'auto'}
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
          onLoadedData={() => {
              setIsLoading(false);
              setRetryCount(0);
          }}
          onLoadedMetadata={() => setIsLoading(false)}
          onError={() => {
              setVideoError(true);
          }}
        >
          Your browser does not support the video tag.
        </video>

        <Image 
          src={posterUrl} 
          onError={() => setPosterError(true)} 
          alt=""
          width={10}
          height={10}
          unoptimized={true}
          className="hidden"
        />
      </div>
    </div>
  );
}