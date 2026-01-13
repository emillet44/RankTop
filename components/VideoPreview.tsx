'use client'
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface VideoPreviewProps {
  videoFiles: File[];
  ranks: string[];
  title: string;
  videoOrder?: number[];
  onSessionCreated?: (sessionId: string, filePaths: string[]) => void;
}

interface ProgressData {
  step: number;
  totalSteps: number;
  progress: number;
  message: string;
  videoUrl?: string;
  complete?: boolean;
  error?: string;
  timestamp: number;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoFiles, ranks, title, videoOrder, onSessionCreated }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{ step: number; totalSteps: number; }>({ step: 0, totalSteps: 0 });

  // Upload helper for the signed URLs (Direct to GCS)
  const uploadFileToSignedUrl = async (file: File, signedUrl: string) => {
    const res = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  };

  const processVideos = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setVideoUrl(null);

    try {
      const sessionId = `session_${Date.now()}`;

      // 1. Get Signed URLs through the proxy
      setCurrentStep('Preparing upload...');
      const urlRes = await fetch('/api/video/preview', {
        method: 'POST',
        body: JSON.stringify({ action: 'getUploadUrls', videoCount: videoFiles.length, sessionId })
      });
      const { uploadUrls, filePaths } = await urlRes.json();

      // Store session for the final submit
      if (onSessionCreated) onSessionCreated(sessionId, filePaths);

      // 2. Upload fragments to GCS
      setCurrentStep('Uploading fragments...');
      await Promise.all(videoFiles.map((file, i) => {
        const info = uploadUrls.find((u: any) => u.index === i);
        return uploadFileToSignedUrl(file, info.url);
      }));

      // 3. Start Processing Stream
      setCurrentStep('Starting render...');
      const response = await fetch('/api/video/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title: title || 'Ranked Post',
          ranks: ranks.filter(r => r.trim() !== ''),
          filePaths,
          // videoOrder logic...
        })
      });

      if (!response.body) throw new Error('No stream available');

      // 4. Handle SSE Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: ProgressData = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);

            // Smooth UI progress
            const uiProg = Math.round(30 + (data.progress * 0.7));
            setProgress(uiProg);
            setCurrentStep(data.message);

            if (data.complete && data.videoUrl) {
              setVideoUrl(data.videoUrl);
              setProcessing(false);
              setProgress(100);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  }, [videoFiles, ranks, title, videoOrder, onSessionCreated]);

  return (
    <div className="w-full max-w-[400px] mx-auto bg-slate-700/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{title || 'Your Title Here'}</h3>
        <button
          type="button"
          onClick={processVideos}
          disabled={processing}
          className={`px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${processing
            ? 'opacity-50 cursor-not-allowed bg-slate-600'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 shadow-lg hover:shadow-xl'
            }`}
        >
          {processing ? 'Processing...' : videoUrl ? 'Reprocess Videos' : 'Process Videos'}
        </button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: '9/16', width: '100%', maxWidth: '400px', margin: '0 auto' }}
      >
        {processing ? (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 flex flex-col items-center justify-center p-6">
            <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 mb-4 animate-spin text-blue-400" />
            <p className="text-lg font-medium text-slate-200 mb-2">Processing videos...</p>
            <p className="text-sm text-slate-400 mb-2">{currentStep}</p>

            {detailedProgress.totalSteps > 0 && (
              <p className="text-xs text-slate-500 mb-4">
                Step {detailedProgress.step} of {detailedProgress.totalSteps}
              </p>
            )}

            <div className="w-full mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-300 font-medium">Progress</span>
                <span className="text-blue-400 font-bold">{progress}%</span>
              </div>
              <div className="relative w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
                />
              </div>
            </div>
          </div>
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            onError={() => setError('Video playback error')}
            crossOrigin="anonymous"
            className="w-full h-full"
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 mb-2" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="mt-2 px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 p-6 text-center">
            Select <span className="font-semibold text-white">Process Videos</span> to create your ranked video.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;