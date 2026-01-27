'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { newList } from '@/components/serverActions/listupload';
import { getSignedGCSUrl } from '@/lib/signedurls';

interface SubmissionOverlayProps {
  formData: FormData;
  videoFiles: File[];
  postType: 'text' | 'image' | 'video';
  onClose: () => void;
}

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  formData,
  videoFiles,
  postType,
  onClose
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const started = useRef(false);

 // Helper to handle completion redirect
  const handleSuccess = useCallback(async (postId: string) => {
    setIsComplete(true);
    setProgress(100);

    if (postType === 'video') {
      setMessage('Verifying playback...');
      const videoUrl = `https://storage.googleapis.com/ranktop-v/${postId}.mp4`;
      const startTime = Date.now();
      
      // Poll for up to 20 seconds
      while (Date.now() - startTime < 20000) {
        try {
          // Add a random query param to bypass browser caching of 404s
          const res = await fetch(`${videoUrl}?t=${Date.now()}`, { 
            method: 'HEAD', 
            cache: 'no-store' 
          });
          
          if (res.ok && res.status === 200) {
             const size = res.headers.get('content-length');
             if (size && parseInt(size) > 1000) break; // It's ready!
          }
        } catch (e) {
          // ignore
        }
        // FIX: Wait only 250ms (quarter second) instead of 2000ms
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    setMessage('Redirecting...');
    // Reduce this cosmetic delay too
    setTimeout(() => router.push(`/post/${postId}`), 100);
  }, [router, postType]);

  const runSubmission = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    try {
      // PHASE 1: VIDEO UPLOADS (If needed)
      // If we have a sessionId from Preview, we SKIP this block
      if (postType === 'video' && !formData.has('sessionId')) {
        setMessage('Preparing cloud storage...');
        setProgress(5);

        const sessionId = `session_${Date.now()}`;

        const urlRes = await fetch('/api/video/final', {
          method: 'POST',
          body: JSON.stringify({ action: 'getUploadUrls', videoCount: videoFiles.length, sessionId })
        });

        const data = await urlRes.json();
        if (!urlRes.ok || !data.uploadUrls) throw new Error(data.error || "Failed to get upload URLs");

        const { uploadUrls, filePaths } = data;

        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          setMessage(`Uploading clip ${i + 1} of ${videoFiles.length}...`);

          const info = uploadUrls.find((u: any) => u.index === i);
          if (!info) throw new Error(`Upload config missing for clip ${i + 1}`);

          const uploadRes = await fetch(info.url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });

          if (!uploadRes.ok) throw new Error(`Upload failed for clip ${i + 1}`);

          setProgress(Math.round(10 + ((i + 1) / videoFiles.length) * 35));
        }

        formData.append('sessionId', sessionId);
        formData.append('filePaths', JSON.stringify(filePaths));
      }

      // PHASE 2: FINAL PROCESSING
      if (postType === 'video') {
        setMessage('Starting final 1080p render...');
        setProgress(46);

        const payload = Object.fromEntries(formData);
        
        // Ensure filePaths is correctly parsed if it came from FormData strings
        const rawFilePaths = formData.get('filePaths');
        const filePaths = typeof rawFilePaths === 'string' ? JSON.parse(rawFilePaths) : [];

        const response = await fetch('/api/video/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            filePaths,
            sessionId: formData.get('sessionId')
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const finalPostId = response.headers.get('X-Post-Id');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        if (!reader) throw new Error("Processing stream unavailable");

        let buffer = '';
        let lastProgress = 46;

        while (true) {
          const { done, value } = await reader.read();
          
          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }

          // Process full lines
          const lines = buffer.split('\n');
          // Keep the last segment in the buffer (it might be incomplete)
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(trimmedLine.slice(6));
              if (data.error) throw new Error(data.error);

              const uiProg = Math.round(46 + (data.progress * 0.54));
              if (uiProg > lastProgress) lastProgress = uiProg;
              setProgress(uiProg);
              
              if (data.message) setMessage(data.message);

              if (data.complete) {
                const targetId = finalPostId || data.videoUrl?.split('/').pop()?.split('.')[0];
                if (targetId) {
                  await handleSuccess(targetId);
                  return; // Exit function immediately on success
                }
              }
            } catch (e) {
              console.warn('Skipped malformed SSE frame');
            }
          }

          if (done) {
            // Check buffer one last time
            if (buffer.trim().startsWith('data: ')) {
               try {
                  const data = JSON.parse(buffer.trim().slice(6));
                  if (data.complete) {
                    const targetId = finalPostId || data.videoUrl?.split('/').pop()?.split('.')[0];
                    if (targetId) {
                        await handleSuccess(targetId);
                        return;
                    }
                  }
               } catch (e) {}
            }

            // SAFETY CHECK: Stream closed logic
            if (lastProgress > 80 && finalPostId) {
                console.log("Stream closed with high progress. Assuming success.");
                await handleSuccess(finalPostId);
            } else {
                throw new Error("Connection closed before completion.");
            }
            break;
          }
        }
      } else if (postType === 'image') {
        // Image Post Logic
        setMessage('Creating post record...');
        setProgress(20);
        const metadataOnly = new FormData();
        formData.forEach((value, key) => {
          if (!(value instanceof File)) metadataOnly.append(key, value);
        });
        const resultId = await newList(metadataOnly);
        if (!resultId) throw new Error("Failed to create post record.");

        const imageFiles: { file: File, index: string }[] = [];
        formData.forEach((value, key) => {
          if (value instanceof File && key.startsWith('img')) {
            imageFiles.push({ file: value, index: key.replace('img', '') });
          }
        });

        setMessage(`Uploading ${imageFiles.length} images...`);
        for (let i = 0; i < imageFiles.length; i++) {
          const { file, index } = imageFiles[i];
          const fileName = `${resultId}${index}.png`;
          const uploadUrl = await getSignedGCSUrl('ranktop-i', fileName, 'write', 5);
          if (!uploadUrl) throw new Error(`Could not generate upload permission for image ${index}`);
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': 'image/png' }
          });
          if (!uploadRes.ok) throw new Error(`Image ${index} failed to upload.`);
          setProgress(20 + Math.round(((i + 1) / imageFiles.length) * 75));
        }
        await handleSuccess(resultId);
      } else {
        // Text Post Logic
        setMessage('Saving post...');
        setProgress(70);
        const resultId = await newList(formData);
        await handleSuccess(resultId);
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred during submission.");
      started.current = false;
    }
  }, [formData, videoFiles, postType, handleSuccess]);

  useEffect(() => {
    runSubmission();
  }, [runSubmission]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/90 backdrop-blur-md px-4">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
        {error ? (
          <>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Submission Error</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button onClick={onClose} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Back to Edit
            </button>
          </>
        ) : isComplete ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-sm text-slate-400">Post created. Redirecting...</p>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Finalizing Post</h2>
            <p className="text-sm text-slate-400 mb-8 h-10 overflow-hidden">{message}</p>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="inline-block mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
              {progress}% Processed
            </span>
          </>
        )}
      </div>
    </div>
  );
};