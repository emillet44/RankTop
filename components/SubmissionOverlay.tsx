'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { newList } from '@/components/serverActions/listupload';
import { upload } from '@/components/serverActions/imgupload';

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
    if (typeof value === 'string' && key !== 'layoutConfig') out[key] = value;
  });
  return out;
}

function getLayoutConfig(formData: FormData): Record<string, any> | null {
  const raw = formData.get('layoutConfig');
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse layoutConfig', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar — only transitions when progress moves forward by >1% to avoid
// thrashing the compositor on every poll tick.
// ─────────────────────────────────────────────────────────────────────────────
const ProgressBar = React.memo(function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full"
        style={{
          width: `${progress}%`,
          // Only apply a transition when there's meaningful movement.
          // This prevents the compositor from firing a new animation frame
          // on every 0.x% polling increment.
          transition: progress > 0 && progress < 100 ? 'width 400ms ease-out' : 'none',
        }}
      />
    </div>
  );
});

export const SubmissionOverlay: React.FC<SubmissionOverlayProps> = ({
  formData,
  videoFiles,
  postType,
  onClose,
  previousSessionId,
  previousFilePaths,
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const started = useRef(false);

  // Throttle setProgress so we never trigger more than one re-render per
  // animation frame during uploads. Rapid progress events (XHR onprogress
  // fires many times per second) previously caused a cascade of style
  // recalculations and compositor updates.
  const rafRef = useRef<number | null>(null);
  const pendingProgress = useRef<number>(0);

  const scheduleProgress = useCallback((value: number) => {
    pendingProgress.current = value;
    if (rafRef.current !== null) return; // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setProgress(pendingProgress.current);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const runSubmission = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    const getApiRoute = (type: 'pre-edited' | 'final') => {
      if (process.env.NEXT_PUBLIC_LOCAL_VIDEO_SERVICE === 'true') {
        return '/api/video/local';
      }
      return `/api/video/${type}`;
    };

    const pollStatus = async (postId: string, route: 'final' | 'pre-edited') => {
      let attempts = 0;
      const maxAttempts = 300;
      const apiRoute = getApiRoute(route);
      while (attempts < maxAttempts) {
        try {
          const res = await fetch(apiRoute, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkStatus', postId, videoMode: route }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'READY' || data.status === 'SUCCESS') return true;
            if (data.status === 'FAILED') throw new Error(data.error || 'Processing failed');
            if (data.progress) scheduleProgress(50 + data.progress * 0.5);
          }
        } catch (e) {
          console.warn('Poll check skipped:', e);
        }
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
      }
      throw new Error('Timed out waiting for video rendering.');
    };

    const uploadWithProgress = (
      url: string,
      file: File,
      onProgress: (pct: number) => void
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload status ${xhr.status}`));
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
        const timestamps: Timestamp[] = timestampsRaw
          ? JSON.parse(timestampsRaw as string)
          : [];

        setMessage('Preparing upload...');
        scheduleProgress(5);
        const sessionId = `pre_${Date.now()}`;

        const urlRes = await fetch(getApiRoute('pre-edited'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getUploadUrl',
            sessionId,
            fileType: file.type,
          }),
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlData.error || 'Failed to get upload URL');

        setMessage('Uploading video...');
        await uploadWithProgress(urlData.uploadUrl, file, (pct) => {
          scheduleProgress(Math.round(5 + pct * 0.4));
          setMessage(`Uploading... ${Math.round(pct)}%`);
        });

        setMessage('Starting render...');
        const payload = extractTextPayload(formData);
        const triggerRes = await fetch(getApiRoute('pre-edited'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            sessionId,
            filePath: urlData.filePath,
            timestamps,
            layoutConfig,
          }),
        });

        if (!triggerRes.ok) throw new Error('Failed to initialize processing.');
        postId = triggerRes.headers.get('X-Post-Id') || '';
        await pollStatus(postId, 'pre-edited');
      } else if (postType === 'video') {
        let sessionId = previousSessionId || `session_${Date.now()}`;
        let filePaths = previousFilePaths;

        if (!filePaths || filePaths.length === 0) {
          setMessage('Preparing storage...');
          const urlRes = await fetch(getApiRoute('final'), {
            method: 'POST',
            body: JSON.stringify({
              action: 'getUploadUrls',
              videoCount: videoFiles.length,
              sessionId,
              fileTypes: videoFiles.map((f) => f.type),
            }),
          });
          const data = await urlRes.json();
          if (!urlRes.ok) throw new Error(data.error || 'Upload failed');
          filePaths = data.filePaths;

          setMessage(`Uploading ${videoFiles.length} clips...`);
          const individualProgress = new Array(videoFiles.length).fill(0);

          const uploadPromises = videoFiles.map((file, i) => {
            const info = data.uploadUrls.find((u: any) => u.index === i);
            if (!info) return Promise.reject(new Error(`No upload URL for index ${i}`));

            return uploadWithProgress(info.url, file, (pct) => {
              individualProgress[i] = pct;
              const totalUploadPct =
                individualProgress.reduce((a, b) => a + b, 0) / videoFiles.length;
              scheduleProgress(Math.round(5 + totalUploadPct * 0.4));
              setMessage(`Uploading clips... ${Math.round(totalUploadPct)}%`);
            });
          });

          await Promise.all(uploadPromises);
        }

        setMessage('Starting render...');
        const payload = extractTextPayload(formData);
        const triggerRes = await fetch(getApiRoute('final'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            ranks: [payload.r1, payload.r2, payload.r3, payload.r4, payload.r5].filter(Boolean),
            filePaths,
            sessionId,
            layoutConfig,
          }),
        });

        if (!triggerRes.ok) throw new Error('Processing initialization failed.');
        postId = triggerRes.headers.get('X-Post-Id') || '';
        await pollStatus(postId, 'final');
      } else if (postType === 'image') {
        setMessage('Creating post...');
        scheduleProgress(10);
        const metadataOnly = new FormData();
        formData.forEach((val, key) => {
          if (!(val instanceof File)) metadataOnly.append(key, val);
        });
        postId = await newList(metadataOnly);

        setMessage('Uploading images...');
        const imageEntries: { file: File; name: string }[] = [];
        formData.forEach((val, key) => {
          if (val instanceof File && key.startsWith('img')) {
            const index = key.replace('img', '');
            imageEntries.push({ file: val, name: `${postId}${index}.png` });
          }
        });

        if (imageEntries.length > 0) {
          const total = imageEntries.length;
          let completed = 0;
          await Promise.all(
            imageEntries.map(async (entry) => {
              await upload(entry.file, entry.name);
              completed++;
              scheduleProgress(10 + (completed / total) * 85);
              setMessage(`Uploading images... ${completed}/${total}`);
            })
          );
        }
      } else {
        setMessage('Saving post...');
        scheduleProgress(40);
        postId = await newList(formData);
      }

      setIsComplete(true);
      scheduleProgress(100);
      setTimeout(() => router.push(`/post/${postId}`), 800);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred.');
      started.current = false;
    }
  }, [formData, videoFiles, postType, router, previousSessionId, previousFilePaths, scheduleProgress]);

  useEffect(() => {
    runSubmission();
  }, [runSubmission]);

  return (
    // Removed backdrop-blur-md — it forces a live per-frame blur of the entire
    // page behind the overlay, which is the single most expensive CSS property
    // during animation. Replaced with a high-opacity solid background which is
    // composited for free.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/95 px-4">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
        {error ? (
          <>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-4xl text-red-500 mb-4"
            />
            <h2 className="text-xl font-bold text-white mb-2">Submission Error</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Back to Edit
            </button>
          </>
        ) : isComplete ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </>
        ) : (
          <>
            {/* Replaced animate-spin FontAwesome spinner with a pure CSS border
                spinner. Border-based spinners composite on the GPU transform
                thread and have near-zero main thread cost, unlike FA icons
                wrapped in a React re-render cycle with animate-spin. */}
            <div className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Finalizing Post</h2>
            <p className="text-sm text-slate-400 mb-8 h-10 overflow-hidden">{message}</p>
            <ProgressBar progress={progress} />
            <span className="inline-block mt-4 text-xs font-mono text-slate-500">
              {Math.floor(progress)}% Processed
            </span>
          </>
        )}
      </div>
    </div>
  );
};