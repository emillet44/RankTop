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
  previousSessionId?: string | null;
  previousFilePaths?: string[] | null;
}

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  formData,
  videoFiles,
  postType,
  onClose,
  previousSessionId,
  previousFilePaths
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const started = useRef(false);

  // --- POLLING HELPER (Checks JSON file via Proxy) ---
  const pollStatus = async (postId: string) => {
    let attempts = 0;
    const maxAttempts = 300; // Approx 10 minutes timeout (300 * 2s)

    while (attempts < maxAttempts) {
      try {
        //hit the 'checkStatus' action on internal API route
        const res = await fetch('/api/video/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'checkStatus', postId })
        });

        if (res.ok) {
          const data = await res.json();

          if (data.status === 'READY' || data.status === 'SUCCESS') {
            return true;
          }
          if (data.status === 'FAILED') {
            throw new Error(data.error || "Processing failed");
          }
          // Update progress bar based on backend calculation if available
          if (data.progress) {
            // Map backend progress (5-100) to UI progress (50-100)
            const uiProgress = 50 + (data.progress * 0.5);
            setProgress(uiProgress);
          }
        }
      } catch (e) {
        console.warn("Poll check skipped:", e);
      }

      // Wait 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
    throw new Error("Timed out waiting for video rendering.");
  };

  // --- UPLOAD HELPER ---
  const uploadWithProgress = (url: string, file: File, onProgress: (pct: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress((e.loaded / e.total) * 100);
        }
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload status ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  // --- MAIN LOGIC ---
  const runSubmission = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    try {
      let postId = '';

      if (postType === 'video') {

        let sessionId = previousSessionId;
        let filePaths = previousFilePaths;

        // 1. Check if we need to upload
        if (sessionId && filePaths && filePaths.length > 0) {
          // SKIP UPLOAD: Reuse existing files from Preview
          setMessage('Using existing video uploads...');
          setProgress(45); // Jump straight to 45%
          await new Promise(r => setTimeout(r, 800)); // Small delay for UX transition
        }
        else {
          // FULL UPLOAD: No preview was done, or data missing
          setMessage('Preparing cloud storage...');
          setProgress(5);

          sessionId = `session_${Date.now()}`;

          const urlRes = await fetch('/api/video/final', {
            method: 'POST',
            body: JSON.stringify({
              action: 'getUploadUrls',
              videoCount: videoFiles.length,
              sessionId,
              fileTypes: videoFiles.map(f => f.type)
            })
          });

          const data = await urlRes.json();
          if (!urlRes.ok || !data.uploadUrls) throw new Error(data.error || "Failed to get upload URLs");

          filePaths = data.filePaths;
          const { uploadUrls } = data;

          for (let i = 0; i < videoFiles.length; i++) {
            const file = videoFiles[i];
            const info = uploadUrls.find((u: any) => u.index === i);

            await uploadWithProgress(info.url, file, (pct) => {
              const stepWeight = 40 / videoFiles.length;
              const baseProgress = 5 + (i * stepWeight);
              const addedProgress = (pct / 100) * stepWeight;
              setProgress(Math.round(baseProgress + addedProgress));
              setMessage(`Uploading clip ${i + 1} of ${videoFiles.length}...`);
            });
          }
        }

        // 2. Trigger Cloud Task (Reusing sessionId and filePaths)
        setMessage('Starting render...');
        setProgress(50);

        const payload = Object.fromEntries(formData);
        const triggerRes = await fetch('/api/video/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            filePaths,
            sessionId
          })
        });

        if (!triggerRes.ok) throw new Error("Failed to initialize server-side processing.");
        postId = triggerRes.headers.get('X-Post-Id') || '';

        // 3. Poll JSON Status
        setMessage('Rendering video...');
        await pollStatus(postId);

        setIsComplete(true);
        setProgress(100);
        setMessage('Redirecting...');
        setTimeout(() => router.push(`/post/${postId}`), 800);

        // === IMAGE PIPELINE ===
      } else if (postType === 'image') {
        setMessage('Creating post record...');
        setProgress(10);

        const metadataOnly = new FormData();
        formData.forEach((val, key) => { if (!(val instanceof File)) metadataOnly.append(key, val); });

        postId = await newList(metadataOnly);
        if (!postId) throw new Error("Could not save post metadata.");

        const imageFiles: { file: File, index: string }[] = [];
        formData.forEach((v, k) => { if (v instanceof File && k.startsWith('img')) imageFiles.push({ file: v, index: k.replace('img', '') }); });

        for (let i = 0; i < imageFiles.length; i++) {
          const { file, index } = imageFiles[i];
          const fileName = `${postId}${index}.png`;
          const uploadUrl = await getSignedGCSUrl('ranktop-i', fileName, 'write', 5);

          if (!uploadUrl) throw new Error("Failed to get signed upload URL.");

          await uploadWithProgress(uploadUrl, file, (pct) => {
            const stepWeight = 80 / imageFiles.length;
            setProgress(Math.round(10 + (i * stepWeight) + (pct / 100 * stepWeight)));
            setMessage(`Uploading image ${i + 1} of ${imageFiles.length}...`);
          });
        }

        setIsComplete(true);
        setProgress(100);
        setMessage('Redirecting...');
        setTimeout(() => router.push(`/post/${postId}`), 800);

        // === TEXT PIPELINE ===
      } else {
        setMessage('Saving post...');
        setProgress(40);
        const resultId = await newList(formData);
        if (!resultId) throw new Error("Failed to save post.");

        setIsComplete(true);
        setProgress(100);
        setMessage('Redirecting...');
        setTimeout(() => router.push(`/post/${resultId}`), 800);
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred.");
      started.current = false;
    }
  }, [formData, videoFiles, postType, router, previousSessionId, previousFilePaths]);

  useEffect(() => { runSubmission(); }, [runSubmission]);

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
              {Math.floor(progress)}% Processed
            </span>
          </>
        )}
      </div>
    </div>
  );
};