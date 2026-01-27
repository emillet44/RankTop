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
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">
                    {retryCount > 0 ? 'Syncing with cloud...' : 'Loading video...'}
                </div>
                {retryCount > 0 && (
                    <div className="text-xs text-slate-500">Attempt {retryCount}/10</div>
                )}
              </div>
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
            
            // Handlers
            onLoadedData={() => {
                setIsLoading(false);
                setRetryCount(0); // Success! Reset retries.
            }}
            onLoadedMetadata={() => setIsLoading(false)}
            onError={() => {
                // Instead of stopping, we trigger the retry loop
                console.warn(`Video load failed. Retry ${retryCount + 1}/10`);
                setVideoError(true);
            }}
          >
            Your browser does not support the video tag.
          </video>

          {/* Hidden Image for Poster Error Detection */}
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

        {variant === 'preview' && <div className="w-8" />}
      </div>
    </div>
  );
}