'use client'

import { useEffect, useRef, useState } from 'react';

interface VideoDisplayProps {
  videoUrl: string;
  title: string;
  description?: string;
  ranks?: (string | null)[];
  variant?: 'full' | 'preview';
}

export function VideoDisplay({
  videoUrl,
  title,
  description = '',
  ranks = [],
  variant = 'full'
}: VideoDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if video is already loaded (cached)
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      // readyState >= 2 means we have current frame data
      setIsLoading(false);
    }
  }, []);

  const posterUrl = `/api/og?title=${encodeURIComponent(title || '')}&description=${encodeURIComponent(description)}&ranks=${encodeURIComponent(ranks.filter(Boolean).join(','))}`;

  return (
    <div>
      {title && variant === 'preview' && (
        <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">{title}</header>
      )}
      <div className={`grid auto-rows-auto items-center ${variant === 'full' ? 'grid-cols-1 justify-items-center' : 'grid-cols-[auto,11fr,auto]'}`}>
        {variant === 'preview' && <div className="w-8" />}

        <div className={`relative rounded-xl overflow-hidden outline outline-slate-700 ${variant === 'full' ? 'w-full aspect-video bg-black' : 'h-[341px] bg-black'}`}>
          {isLoading && (
            <div className="absolute inset-0 bg-slate-800/50 animate-pulse flex items-center justify-center">
              <div className="text-slate-400 text-sm">Loading video...</div>
            </div>
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            controls
            playsInline
            preload={variant === 'preview' ? 'metadata' : 'auto'}
            crossOrigin="anonymous"
            className="w-full h-full object-contain"
            onLoadedData={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {variant === 'preview' && <div className="w-8" />}
      </div>
    </div>
  );
}