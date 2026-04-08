'use client'
import React, { useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faPlayCircle, faSync } from '@fortawesome/free-solid-svg-icons';
import { VideoLayoutConfig } from '@/lib/video-settings';

interface Timestamp {
  rankIndex: number;
  time: number;
}

interface VideoPreviewProps {
  videoFiles: File[];
  ranks: string[];
  title: string;
  onSessionCreated?: (sessionId: string, filePaths: string[]) => void;
  // Pre-edited mode props
  videoMode?: 'auto' | 'pre-edited';
  timestamps?: Timestamp[];
  endTime?: number | null;
  layoutConfig: VideoLayoutConfig;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoFiles,
  ranks,
  title,
  onSessionCreated,
  videoMode = 'auto',
  timestamps,
  endTime,
  layoutConfig,
}) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  // Upload helper with progress
  const uploadWithProgress = (url: string, file: File, onProgress: (pct: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(file);
    });
  };

  // Shared polling logic
  const pollForResult = (sessionId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          const statusRes = await fetch('/api/video/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkStatus', sessionId })
          });
          const statusData = await statusRes.json();

          if (statusData.status === 'SUCCESS' && statusData.videoUrl) {
            clearInterval(pollInterval);
            resolve(statusData.videoUrl);
          } else if (statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            reject(new Error(statusData.error || 'Rendering failed'));
          } else {
            // Fake progress creep while waiting
            setProgress(prev => Math.min(prev + 1, 95));
          }

          if (attempts > 90) { // Increased timeout for potentially heavier renders
            clearInterval(pollInterval);
            reject(new Error('Rendering timed out'));
          }
        } catch (e: any) {
          clearInterval(pollInterval);
          reject(e);
        }
      }, 2000);
    });
  };

  const processVideos = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setError(null);
    setVideoUrl(null);
    setProgress(0);

    try {
      const sessionId = `session_${Date.now()}`;

      if (videoMode === 'pre-edited') {
        const file = videoFiles[0];
        if (!file) throw new Error('No pre-edited video file found.');
        if (!timestamps || timestamps.length === 0) throw new Error('No timestamps provided.');
        if (endTime == null) throw new Error('No end time provided.');

        setStatusMessage('Preparing upload...');
        setProgress(5);

        const urlRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUploadUrl', sessionId, fileType: file.type })
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok || !urlData.uploadUrl) throw new Error(urlData.error || 'Failed to get upload URL');

        setStatusMessage('Uploading video...');
        await uploadWithProgress(urlData.uploadUrl, file, (pct) => {
          setProgress(Math.round(5 + pct * 0.45));
          setStatusMessage(`Uploading video... ${Math.round(pct)}%`);
        });

        setStatusMessage('Queuing render...');
        setProgress(55);

        const triggerRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'triggerPreEdited',
            sessionId,
            title: title || 'Ranked Post',
            ranks: ranks.filter(r => r.trim() !== ''),
            filePath: urlData.filePath,
            timestamps,
            endTime,
            layoutConfig,
          })
        });
        if (!triggerRes.ok) throw new Error('Failed to start rendering task');

        setStatusMessage('Rendering preview...');
        const resultUrl = await pollForResult(sessionId);

        setVideoUrl(resultUrl);
        setProgress(100);

      } else {
        setStatusMessage('Preparing upload...');
        const urlRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'getUploadUrls', 
            videoCount: videoFiles.length, 
            sessionId,
            fileTypes: videoFiles.map(f => f.type)
          })
        });
        const { uploadUrls, filePaths } = await urlRes.json();

        if (onSessionCreated) onSessionCreated(sessionId, filePaths);

        setStatusMessage('Uploading clips...');
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          const info = uploadUrls.find((u: any) => u.index === i);
          await uploadWithProgress(info.url, file, (pct) => {
            const step = 50 / videoFiles.length;
            setProgress(Math.round((i * step) + (pct * (step / 100))));
          });
        }

        setStatusMessage('Queuing render...');
        setProgress(55);
        const triggerRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'trigger',
            sessionId,
            title: title || 'Ranked Post',
            ranks: ranks.filter(r => r.trim() !== ''),
            filePaths,
            layoutConfig,
          })
        });
        if (!triggerRes.ok) throw new Error('Failed to start rendering task');

        setStatusMessage('Rendering preview...');
        const resultUrl = await pollForResult(sessionId);

        setVideoUrl(resultUrl);
        setProgress(100);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [videoFiles, ranks, title, onSessionCreated, videoMode, timestamps, endTime, layoutConfig]);

  return (
    <div className="w-full max-w-[400px] mx-auto bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">{title || 'Preview'}</h3>
        <button
          onClick={processVideos}
          disabled={processing}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            processing 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
          }`}
        >
          <FontAwesomeIcon icon={videoUrl ? faSync : faPlayCircle} className={processing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
          {processing ? 'Processing' : videoUrl ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] w-full max-w-[280px] mx-auto border border-slate-700 shadow-2xl">
        {processing ? (
          <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-6" />
            <p className="text-white font-bold text-sm mb-3 tracking-wide">{statusMessage}</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{progress}% Complete</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-full object-cover" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center bg-red-950/20">
            <div className="w-12 h-12 rounded-full bg-red-950/40 flex items-center justify-center mb-4 border border-red-900/50">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Generation Failed</p>
            <p className="text-xs text-red-300/70 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-900">
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;