'use client'
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface VideoPreviewProps {
  videoFiles: File[];
  ranks: string[];
  title: string;
  videoOrder?: number[];
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

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoFiles, ranks, title, videoOrder }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<{
    step: number;
    totalSteps: number;
  }>({ step: 0, totalSteps: 0 });

  const uploadFileToSignedUrl = async (file: File, signedUrl: string): Promise<void> => {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'video/mp4'
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed for file: ${response.status} ${response.statusText}`);
    }
  };

  const processVideos = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Initializing...');
    setVideoUrl(null);
    setDetailedProgress({ step: 0, totalSteps: 0 });

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Step 1: Get signed upload URLs
      setCurrentStep('Getting upload URLs...');
      setProgress(5);

      const uploadUrlResponse = await fetch('https://video-processor2-143130158879.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'getUploadUrls',
          videoCount: videoFiles.length,
          sessionId: sessionId
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URLs: ${uploadUrlResponse.status}`);
      }

      const { uploadUrls, filePaths } = await uploadUrlResponse.json();

      // Step 2: Upload files directly to GCS
      setCurrentStep('Uploading videos to cloud storage...');
      setProgress(10);

      const uploadPromises = videoFiles.map(async (file, index) => {
        const uploadInfo = uploadUrls.find((u: any) => u.index === index);
        if (!uploadInfo) {
          throw new Error(`No upload URL found for video ${index}`);
        }
        
        await uploadFileToSignedUrl(file, uploadInfo.url);
        
        // Update progress for each completed upload
        const completedUploads = index + 1;
        const uploadProgress = 10 + (completedUploads / videoFiles.length) * 20; // 10% to 30%
        setProgress(Math.round(uploadProgress));
        
        if (completedUploads === videoFiles.length) {
          setCurrentStep('All videos uploaded. Starting processing...');
        } else {
          setCurrentStep(`Uploaded ${completedUploads}/${videoFiles.length} videos...`);
        }
      });

      await Promise.all(uploadPromises);

      // Step 3: Trigger processing
      setCurrentStep('Starting video processing...');
      setProgress(35);

      const processResponse = await fetch('https://video-processor2-143130158879.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          title: title,
          ranks: ranks,
          videoOrder: videoOrder || videoFiles.map((_, i) => videoFiles.length - 1 - i),
          filePaths: filePaths
        })
      });

      if (!processResponse.ok) {
        throw new Error(`Processing request failed: ${processResponse.status} ${processResponse.statusText}`);
      }

      // Step 4: Read the SSE stream for processing updates
      const reader = processResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ProgressData = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Adjust progress to account for upload phase (35% + remaining 65%)
              const adjustedProgress = 35 + (data.progress * 0.65);
              setProgress(Math.round(adjustedProgress));
              setCurrentStep(data.message);
              setDetailedProgress({
                step: data.step,
                totalSteps: data.totalSteps
              });

              if (data.complete && data.videoUrl) {
                setVideoUrl(data.videoUrl);
                setProcessing(false);
                setProgress(100);
                setCurrentStep('Complete!');
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

    } catch (err) {
      console.error('Processing error:', err);
      setError(`Processing failed: ${err}`);
      setProcessing(false);
    }
  }, [videoFiles, ranks, title, videoOrder]);

  return (
    <div className="w-full max-w-[400px] mx-auto bg-slate-700/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {!videoUrl && (
          <button 
            type="button"
            onClick={processVideos} 
            disabled={processing}
            className={`px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
              processing 
                ? 'opacity-50 cursor-not-allowed bg-slate-600' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 shadow-lg hover:shadow-xl'
            }`}
          >
            {processing ? 'Processing...' : 'Process Videos'}
          </button>
        )}
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
            className="w-full h-full"
            controls
            preload="metadata"
            onError={() => setError('Video playback error')}
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
          <div className="flex items-center justify-center h-full text-slate-400 p-4 text-center">
            <span>Click "Process Videos" to start</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;