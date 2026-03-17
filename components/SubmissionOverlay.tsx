'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { newList } from '@/components/serverActions/listupload';
import { upload } from '@/components/serverActions/imgupload';
import { getSignedGCSUrl } from '@/lib/signedurls';

interface Timestamp {
  rankIndex: number;
  time: number;
}

interface SubmissionOverlayProps {
  formData: FormData;
  videoFiles: File[];
  postType: 'text' | 'image' | 'video';
  onClose: () => void;
  previousSessionId?: string | null;
  previousFilePaths?: string[] | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payload Helpers
// ─────────────────────────────────────────────────────────────────────────────
function extractTextPayload(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  formData.forEach((value, key) => {
    // Skip the layoutConfig JSON and Files; we handle layoutConfig separately
    if (typeof value === 'string' && key !== 'layoutConfig') out[key] = value;
  });
  return out;
}

// THE SCALABLE SOLUTION: Just grab the JSON string from the hidden input
function getLayoutConfig(formData: FormData): Record<string, any> | null {
  const raw = formData.get('layoutConfig');
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse layoutConfig", e);
    return null;
  }
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

  const runSubmission = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    const pollStatus = async (postId: string, route: 'final' | 'pre-edited') => {
      let attempts = 0;
      const maxAttempts = 300;
      while (attempts < maxAttempts) {
        try {
          const res = await fetch(`/api/video/${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkStatus', postId })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'READY' || data.status === 'SUCCESS') return true;
            if (data.status === 'FAILED') throw new Error(data.error || 'Processing failed');
            if (data.progress) setProgress(50 + (data.progress * 0.5));
          }
        } catch (e) { console.warn('Poll check skipped:', e); }
        await new Promise(r => setTimeout(r, 2000));
        attempts++;
      }
      throw new Error('Timed out waiting for video rendering.');
    };

    const uploadWithProgress = (url: string, file: File, onProgress: (pct: number) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress((e.loaded / e.total) * 100); };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload status ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });
    };

    try {
      let postId = '';
      const videoMode = formData.get('videoMode') as string | null;
      const layoutConfig = postType === 'video' ? getLayoutConfig(formData) : null;

      if (postType === 'video' && videoMode === 'pre-edited') {
        const file = videoFiles[0];
        if (!file) throw new Error('No video file found.');

        const timestampsRaw = formData.get('timestamps');
        const timestamps: Timestamp[] = timestampsRaw ? JSON.parse(timestampsRaw as string) : [];

        setMessage('Preparing upload...');
        setProgress(5);
        const sessionId = `pre_${Date.now()}`;

        const urlRes = await fetch('/api/video/pre-edited', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUploadUrl', sessionId, fileType: file.type })
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlData.error || 'Failed to get upload URL');

        setMessage('Uploading video...');
        await uploadWithProgress(urlData.uploadUrl, file, (pct) => {
          setProgress(Math.round(5 + pct * 0.4));
          setMessage(`Uploading... ${Math.round(pct)}%`);
        });

        setMessage('Starting render...');
        const payload = extractTextPayload(formData);
        const triggerRes = await fetch('/api/video/pre-edited', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            sessionId,
            filePath: urlData.filePath,
            timestamps,
            layoutConfig
          })
        });

        if (!triggerRes.ok) throw new Error('Failed to initialize processing.');
        postId = triggerRes.headers.get('X-Post-Id') || '';
        await pollStatus(postId, 'pre-edited');

      } else if (postType === 'video') {
        let sessionId = previousSessionId || `session_${Date.now()}`;
        let filePaths = previousFilePaths;

        if (!filePaths || filePaths.length === 0) {
          setMessage('Preparing storage...');
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
          if (!urlRes.ok) throw new Error(data.error || 'Upload failed');
          filePaths = data.filePaths;

          // --- PARALLEL UPLOAD LOGIC START ---
          setMessage(`Uploading ${videoFiles.length} clips...`);

          // Track individual progress for each file to calculate a global average
          const individualProgress = new Array(videoFiles.length).fill(0);

          const uploadPromises = videoFiles.map((file, i) => {
            const info = data.uploadUrls.find((u: any) => u.index === i);
            if (!info) return Promise.reject(new Error(`No upload URL for index ${i}`));

            return uploadWithProgress(info.url, file, (pct) => {
              individualProgress[i] = pct;

              // Calculate the weighted average of all uploads
              const totalUploadPct = individualProgress.reduce((a, b) => a + b, 0) / videoFiles.length;

              // We reserve 5% for init and 40% for the upload phase (Total 45%)
              setProgress(Math.round(5 + (totalUploadPct * 0.4)));
              setMessage(`Uploading clips... ${Math.round(totalUploadPct)}%`);
            });
          });

          // Fire them all off at once!
          await Promise.all(uploadPromises);
          // --- PARALLEL UPLOAD LOGIC END ---
        }

        setMessage('Starting render...');
        const payload = extractTextPayload(formData);
        const triggerRes = await fetch('/api/video/final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            filePaths,
            sessionId,
            layoutConfig
          })
        });

        if (!triggerRes.ok) throw new Error('Processing initialization failed.');
        postId = triggerRes.headers.get('X-Post-Id') || '';
        await pollStatus(postId, 'final');

      } else if (postType === 'image') {
        setMessage('Creating post...');
        setProgress(10);
        const metadataOnly = new FormData();
        formData.forEach((val, key) => { if (!(val instanceof File)) metadataOnly.append(key, val); });
        postId = await newList(metadataOnly);
        
        // --- IMAGE UPLOAD LOGIC ---
        setMessage('Uploading images...');
        const imageEntries: { file: File, name: string }[] = [];
        formData.forEach((val, key) => {
          if (val instanceof File && key.startsWith('img')) {
            const index = key.replace('img', '');
            imageEntries.push({ file: val, name: `${postId}${index}.png` });
          }
        });

        if (imageEntries.length > 0) {
          const total = imageEntries.length;
          let completed = 0;
          await Promise.all(imageEntries.map(async (entry) => {
            await upload(entry.file, entry.name);
            completed++;
            setProgress(10 + (completed / total) * 85);
            setMessage(`Uploading images... ${completed}/${total}`);
          }));
        }
      } else {
        setMessage('Saving post...');
        setProgress(40);
        postId = await newList(formData);
      }

      setIsComplete(true);
      setProgress(100);
      setTimeout(() => router.push(`/post/${postId}`), 800);

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || 'An error occurred.');
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
            <button onClick={onClose} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Back to Edit</button>
          </>
        ) : isComplete ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Finalizing Post</h2>
            <p className="text-sm text-slate-400 mb-8 h-10 overflow-hidden">{message}</p>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="inline-block mt-4 text-xs font-mono text-slate-500">{Math.floor(progress)}% Processed</span>
          </>
        )}
      </div>
    </div>
  );
};