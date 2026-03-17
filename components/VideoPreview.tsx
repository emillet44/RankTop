'use client'
import React, { useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faPlayCircle } from '@fortawesome/free-solid-svg-icons';

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
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoFiles,
  ranks,
  title,
  onSessionCreated,
  videoMode = 'auto',
  timestamps,
  endTime,
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

          if (attempts > 60) {
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
        // ── PRE-EDITED PREVIEW PIPELINE ──────────────────────────────────

        const file = videoFiles[0];
        if (!file) throw new Error('No pre-edited video file found.');
        if (!timestamps || timestamps.length === 0) throw new Error('No timestamps provided.');
        if (endTime == null) throw new Error('No end time provided.');

        // 1. Get signed upload URL for single source file
        setStatusMessage('Preparing upload...');
        setProgress(5);

        const urlRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUploadUrl', sessionId, fileType: file.type })
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok || !urlData.uploadUrl) throw new Error(urlData.error || 'Failed to get upload URL');

        // 2. Upload the source file
        setStatusMessage('Uploading video...');
        await uploadWithProgress(urlData.uploadUrl, file, (pct) => {
          setProgress(Math.round(5 + pct * 0.45)); // 5% → 50%
          setStatusMessage(`Uploading video... ${Math.round(pct)}%`);
        });

        // 3. Trigger pre-edited render via Cloud Task
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
          })
        });
        if (!triggerRes.ok) throw new Error('Failed to start rendering task');

        // 4. Poll for result
        setStatusMessage('Rendering preview...');
        const resultUrl = await pollForResult(sessionId);

        setVideoUrl(resultUrl);
        setProgress(100);

      } else {
        // ── AUTO-STITCH PREVIEW PIPELINE ─────────────────────────────────

        // 1. Get Upload URLs
        setStatusMessage('Preparing upload...');
        const urlRes = await fetch('/api/video/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUploadUrls', videoCount: videoFiles.length, sessionId })
        });
        const { uploadUrls, filePaths } = await urlRes.json();

        if (onSessionCreated) onSessionCreated(sessionId, filePaths);

        // 2. Upload files (0–50%)
        setStatusMessage('Uploading clips...');
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          const info = uploadUrls.find((u: any) => u.index === i);
          await uploadWithProgress(info.url, file, (pct) => {
            const step = 50 / videoFiles.length;
            setProgress(Math.round((i * step) + (pct * (step / 100))));
          });
        }

        // 3. Trigger Cloud Task
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
            filePaths
          })
        });
        if (!triggerRes.ok) throw new Error('Failed to start rendering task');

        // 4. Poll for result
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
  }, [videoFiles, ranks, title, onSessionCreated, videoMode, timestamps, endTime]);

  return (
    <div className="w-full max-w-[400px] mx-auto bg-slate-700/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{title || 'Preview'}</h3>
        <button
          onClick={processVideos}
          disabled={processing}
          className={`px-3 py-2 rounded-md transition-all text-sm font-medium ${
            processing ? 'opacity-50 cursor-not-allowed bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing ? 'Processing' : videoUrl ? 'Refresh' : 'Generate'}
        </button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16] w-full max-w-[400px] mx-auto">
        {processing ? (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
            <FontAwesomeIcon icon={faSpinner} className="h-10 w-10 mb-4 animate-spin text-blue-400" />
            <p className="text-white font-medium mb-2">{statusMessage}</p>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{progress}%</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-full object-cover" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <FontAwesomeIcon icon={faPlayCircle} className="h-12 w-12 mb-2 opacity-50" />
            <p>Click Generate to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;