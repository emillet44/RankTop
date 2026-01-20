'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { newList } from '@/components/serverActions/listupload';

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

  const runSubmission = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    try {
      // PHASE 1: UPLOADS (5% to 45%)
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
          const uploadRes = await fetch(info.url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });

          if (!uploadRes.ok) throw new Error(`Upload failed for clip ${i + 1}`);

          // Progress mapping for uploads
          setProgress(Math.round(10 + ((i + 1) / videoFiles.length) * 35));
        }

        formData.append('sessionId', sessionId);
        formData.append('filePaths', JSON.stringify(filePaths));
      }

      // PHASE 2: RENDERING (46% to 100%)
      if (postType === 'video') {
        setMessage('Starting final render...');
        setProgress(46);

        const payload = Object.fromEntries(formData);
        const response = await fetch('/api/video/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            filePaths: JSON.parse(formData.get('filePaths') as string || '[]'),
            sessionId: formData.get('sessionId')
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const finalPostId = response.headers.get('X-Post-Id');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Processing stream unavailable");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Crucial: Use stream: true to prevent broken JSON chunks
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) throw new Error(data.error);

                // --- Improved Mapping Logic ---
                // Server 0-15% (Downloading) maps to UI 46-50%
                // Server 15-90% (Rendering) maps to UI 50-90%
                // Server 90-100% (Finalizing) maps to UI 90-100%
                let uiProg;
                if (data.progress <= 15) {
                  uiProg = Math.round(46 + (data.progress * 0.26)); 
                } else if (data.progress <= 90) {
                  uiProg = Math.round(50 + ((data.progress - 15) * 0.53));
                } else {
                  uiProg = Math.round(90 + ((data.progress - 90) * 1.0));
                }

                setProgress(Math.min(uiProg, 100));

                // Clean up the message for the user
                if (data.progress <= 15) {
                  setMessage('Initializing render engine...');
                } else {
                  setMessage(data.message || 'Processing...');
                }

                if (data.complete) {
                  setProgress(100);
                  setIsComplete(true);
                  setTimeout(() => router.push(`/post/${finalPostId}`), 1200);
                }
              } catch (e) {
                // Silently skip malformed JSON chunks that occur during high-speed streaming
                console.debug("Partial stream chunk ignored");
              }
            }
          }
        }
      } else {
        // TEXT/IMAGE LOGIC
        setMessage('Saving post...');
        setProgress(70);
        const resultId = await newList(formData);
        setProgress(100);
        setIsComplete(true);
        setTimeout(() => router.push(`/post/${resultId}`), 1000);
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred.");
      started.current = false;
    }
  }, [formData, videoFiles, postType, router]);

  useEffect(() => {
    runSubmission();
  }, [runSubmission]);

  // UI remains the same as your provided code
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