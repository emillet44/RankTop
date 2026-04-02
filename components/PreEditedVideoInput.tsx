'use client'

import { useRef, useState, useEffect, useCallback, memo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay,
  faPause,
  faFlag,
  faFlagCheckered,
  faCircleXmark,
  faCheck,
  faRotateLeft,
  faVideo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons"

interface Timestamp {
  rankIndex: number;
  time: number; // seconds
}

interface PreEditedVideoInputProps {
  ranks: number;
  onTimestampsChange: (timestamps: Timestamp[], endTime: number | null, file: File | null) => void;
}

function formatTime(seconds: number, withMs = false): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const base = `${m}:${s.toString().padStart(2, "0")}`;
  if (!withMs) return base;
  const ms = Math.floor((seconds % 1) * 1000);
  return `${base}.${ms.toString().padStart(3, "0")}`;
}

const NUDGE_MS = 0.010; // 10 milliseconds
const MIN_SEGMENT_DURATION = 0.1; // 100ms minimum between marks

// Checks whether the browser can actually decode and display the video at the
// given object URL. Returns false for unsupported codecs (e.g. H.265 on Chrome/Windows).
// Uses a hidden video element since VideoDecoder.isConfigSupported doesn't cover
// container-level support reliably across browsers.
function checkVideoSupport(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';

    const cleanup = () => {
      video.src = '';
      video.load();
    };

    // Timeout fallback — if neither event fires within 5s, assume unsupported
    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 5000);

    // When a loadedmetadata event with a non-zero video track is received, it is supported
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      const supported = video.videoWidth > 0 && video.videoHeight > 0;
      cleanup();
      resolve(supported);
    };

    // Any error means the browser can't handle it
    video.onerror = () => {
      clearTimeout(timer);
      cleanup();
      resolve(false);
    };

    video.src = url;
    video.load();
  });
}

interface TimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  timestamps: (number | null)[];
  endTime: number | null;
  ranks: number;
}

const Timeline = memo(function Timeline({ duration, currentTime, onSeek, timestamps, endTime, ranks }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const getSeekRatio = (clientX: number): number => {
    if (!timelineRef.current || duration === 0) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onSeek(getSeekRatio(e.clientX) * duration);
    const onMouseMove = (moveEvent: MouseEvent) => {
      onSeek(getSeekRatio(moveEvent.clientX) * duration);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={timelineRef}
        className="relative h-3 bg-slate-700 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full pointer-events-none" style={{ width: `${progress * 100}%` }} />
        {timestamps.map((t, i) => t !== null && (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white bg-amber-400 z-10 pointer-events-none"
            style={{ left: `${(t / duration) * 100}%` }}
          />
        ))}
        {endTime !== null && duration > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-sm border-2 border-white bg-red-400 z-10 pointer-events-none rotate-45"
            style={{ left: `${(endTime / duration) * 100}%` }}
          />
        )}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-md pointer-events-none" style={{ left: `${progress * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 font-mono">
        <span>{formatTime(currentTime, true)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
});

interface MarkerRowProps {
  icon: React.ReactNode;
  time: number | null;
  isNextToBeMark: boolean;
  pendingLabel: string;
  onClear: () => void;
  onPreview: () => void;
  accentBg: string;
  dotClass: string;
}

const MarkerRow = memo(function MarkerRow({
  icon,
  time,
  isNextToBeMark,
  pendingLabel,
  onClear,
  onPreview,
  accentBg,
  dotClass,
}: MarkerRowProps) {
  const hasTime = time !== null;
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all
        ${hasTime
          ? "bg-slate-700 bg-opacity-60"
          : isNextToBeMark
            ? `${accentBg} border border-opacity-40`
            : "bg-slate-800 bg-opacity-30 border border-slate-700 border-opacity-40"
        }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${hasTime ? dotClass : "bg-slate-600 text-slate-400"}`}>
          {icon}
        </span>
        <span className={`text-sm font-mono ${hasTime ? "text-white" : isNextToBeMark ? "text-amber-300" : "text-slate-500"}`}>
          {hasTime ? formatTime(time, true) : isNextToBeMark ? pendingLabel : "Not set"}
        </span>
      </div>
      {hasTime && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <FontAwesomeIcon icon={faCircleXmark} className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

export default function PreEditedVideoInput({ ranks, onTimestampsChange }: PreEditedVideoInputProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timestamps, setTimestamps] = useState<(number | null)[]>(Array(ranks).fill(null));
  const [endTime, setEndTime] = useState<number | null>(null);
  const [nextToMark, setNextToMark] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  // Transient validation errors (auto-dismiss after 3s)
  const [markError, setMarkError] = useState<string | null>(null);
  // Persistent format/codec errors (only cleared on successful load or reset)
  const [formatError, setFormatError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  const markErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(duration);

  // Use a ref for the callback to avoid infinite loops when passed as a dependency
  const onTimestampsChangeRef = useRef(onTimestampsChange);
  useEffect(() => {
    onTimestampsChangeRef.current = onTimestampsChange;
  }, [onTimestampsChange]);

  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Resize timestamps array when ranks count changes — preserve existing entries
  useEffect(() => {
    setTimestamps(prev => {
      if (prev.length === ranks) return prev;
      if (ranks > prev.length) {
        return [...prev, ...Array(ranks - prev.length).fill(null)];
      } else {
        return prev.slice(0, ranks);
      }
    });
    setNextToMark(prev => (ranks < prev ? ranks : prev));
  }, [ranks]);

  // Notify parent whenever timestamps, endTime, or file changes.
  // Slot i corresponds to rankIndex (ranks - 1 - i) as the highest rank is marked first.
  useEffect(() => {
    const mapped: Timestamp[] = timestamps
      .map((t, i) => ({ rankIndex: ranks - 1 - i, time: t ?? 0 }))
      .filter((_, i) => timestamps[i] !== null);
    onTimestampsChangeRef.current(mapped, endTime, videoFile);
  }, [timestamps, endTime, videoFile, ranks]);

  // Arrow key nudge
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (!videoRef.current || durationRef.current === 0) return;
    if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? NUDGE_MS : -NUDGE_MS;
    const next = Math.max(0, Math.min(durationRef.current, Math.round(videoRef.current.currentTime * 1000 + delta * 1000) / 1000));
    seekTo(next);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Show a transient error message that auto-clears after 3s
  const showMarkError = (msg: string) => {
    setMarkError(msg);
    if (markErrorTimerRef.current) clearTimeout(markErrorTimerRef.current);
    markErrorTimerRef.current = setTimeout(() => setMarkError(null), 3000);
  };

  // Sync currentTime from video element via rAF
  const startTracking = () => {
    const track = () => {
      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
      animFrameRef.current = requestAnimationFrame(track);
    };
    animFrameRef.current = requestAnimationFrame(track);
  };

  const stopTracking = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  useEffect(() => () => stopTracking(), []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await loadFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) await loadFile(file);
  };

  const loadFile = async (file: File) => {
    // Clear any previous format error while the new file is checked
    setFormatError(null);

    // Normalize audio/* container types to video/* (some OS/browser combos
    // misreport mp4 files with video tracks as audio/mp4)
    const normalizedType = file.type.startsWith('audio/')
      ? file.type.replace('audio/', 'video/')
      : file.type;
    const normalizedFile = normalizedType !== file.type
      ? new File([file], file.name, { type: normalizedType })
      : file;

    // Check browser can actually decode this file before accepting it.
    // H.265/HEVC is not supported in Chrome on Windows (licensing issue).
    const url = URL.createObjectURL(normalizedFile);
    const supported = await checkVideoSupport(url);
    if (!supported) {
      URL.revokeObjectURL(url);
      // Use persistent formatError, not the auto-dismissing showMarkError
      setFormatError(
        "This video format isn't supported by your browser (likely H.265/HEVC). " +
        "Please re-export as H.264 (MP4) and try again."
      );
      return;
    }

    setVideoFile(normalizedFile);
    setVideoUrl(url);
    setTimestamps(Array(ranks).fill(null));
    setEndTime(null);
    setNextToMark(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setMarkError(null); // only clear transient errors on a successful load
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      stopTracking();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      startTracking();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    stopTracking();
  };

  const handleMarkRank = () => {
    if (!videoRef.current || nextToMark >= ranks) return;
    const t = videoRef.current.currentTime;

    // The rank being marked at slot nextToMark is the (ranks - 1 - nextToMark)th rank
    const currentRankNum = ranks - nextToMark; // display number (e.g. 4, 3, 2, 1)

    // Must be strictly after the previous slot's timestamp
    const prevTime = nextToMark > 0 ? (timestamps[nextToMark - 1] ?? null) : null;
    if (prevTime !== null && t <= prevTime + MIN_SEGMENT_DURATION) {
      showMarkError(`Rank ${currentRankNum} must be at least ${MIN_SEGMENT_DURATION * 1000}ms after Rank ${currentRankNum + 1} (${formatTime(prevTime, true)})`);
      return;
    }

    if (nextToMark === 0 && t >= durationRef.current - MIN_SEGMENT_DURATION) {
      showMarkError(`Mark Rank ${currentRankNum} earlier in the video.`);
      return;
    }

    setMarkError(null);
    setTimestamps(prev => {
      const next = [...prev];
      next[nextToMark] = t;
      return next;
    });
    setNextToMark(prev => prev + 1);
  };

  const handleMarkEnd = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;

    // End must be strictly after the last set rank timestamp
    const lastSetTime = [...timestamps].reverse().find(ts => ts !== null) ?? null;
    if (lastSetTime !== null && t <= lastSetTime + MIN_SEGMENT_DURATION) {
      showMarkError(`End must be at least ${MIN_SEGMENT_DURATION * 1000}ms after the last rank (${formatTime(lastSetTime, true)})`);
      return;
    }

    // If no ranks are set yet, end time is meaningless
    if (lastSetTime === null) {
      showMarkError("Mark at least Rank 1 before marking the end.");
      return;
    }

    setMarkError(null);
    setEndTime(t);
  };

  const clearTimestamp = (index: number) => {
    setTimestamps(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setNextToMark(prev => Math.min(prev, index));
    setMarkError(null);
  };

  const clearEnd = () => {
    setEndTime(null);
    setMarkError(null);
  };

  const resetAll = () => {
    setTimestamps(Array(ranks).fill(null));
    setNextToMark(0);
    setEndTime(null);
    setMarkError(null);
    setFormatError(null);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      stopTracking();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const allMarked = timestamps.every(t => t !== null) && endTime !== null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Format/codec error — persistent until a valid file is loaded ── */}
      {formatError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 shrink-0" />
          {formatError}
        </div>
      )}
      {/* ── Transient validation error — auto-dismisses after 3s ── */}
      {markError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 shrink-0" />
          {markError}
        </div>
      )}
      {!videoUrl ? (
        /* ── Drop zone ── */
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 p-10 cursor-pointer
            ${isDragging
              ? "border-blue-400 bg-blue-500 bg-opacity-10"
              : "border-slate-600 bg-slate-800 bg-opacity-30 hover:border-slate-400 hover:bg-opacity-40"
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FontAwesomeIcon icon={faVideo} className="w-10 h-10 text-slate-500" />
          <p className="text-slate-400 text-center">
            Drop your pre-edited video here, or <span className="text-blue-400 underline">browse</span>
          </p>
          <p className="text-slate-600 text-sm">MP4, MOV, WebM supported</p>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* ── Header: filename + Reset / Change ── */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-400 truncate max-w-[60%]">{videoFile?.name}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={resetAll} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
                <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
                Reset
              </button>
              <button type="button" onClick={() => { setVideoFile(null); setVideoUrl(null); resetAll(); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors">
                <FontAwesomeIcon icon={faCircleXmark} className="w-3 h-3" />
                Change
              </button>
            </div>
          </div>

          {/* ── Video player ── */}
          <div className="relative rounded-xl bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl ?? undefined}
              className="w-full max-h-72 rounded-xl"
              onLoadedMetadata={handleVideoLoaded}
              onEnded={handleVideoEnded}
            />
          </div>

          {/* ── Timeline scrubber ── */}
          <Timeline
            duration={duration}
            currentTime={currentTime}
            onSeek={seekTo}
            timestamps={timestamps}
            endTime={endTime}
            ranks={ranks}
          />

          {/* ── Playback controls ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="w-4 h-4 text-white" />
            </button>

            {/* Mark rank button */}
            <button
              type="button"
              onClick={handleMarkRank}
              disabled={nextToMark >= ranks}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                ${nextToMark >= ranks
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-black"
                }`}
            >
              <FontAwesomeIcon icon={faFlag} className="w-3.5 h-3.5" />
              {nextToMark < ranks ? `Mark Rank ${ranks - nextToMark}` : "All ranks marked"}
            </button>

            {/* Mark end button */}
            <button
              type="button"
              onClick={handleMarkEnd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-red-900 bg-opacity-50 hover:bg-opacity-80 text-red-300 hover:text-red-200 border border-red-800 transition-all"
            >
              <FontAwesomeIcon icon={faFlagCheckered} className="w-3.5 h-3.5" />
              Mark End
            </button>
          </div>

          {/* ── Timestamp list ── */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-400 font-medium">
              Timestamps
              {allMarked && (
                <span className="ml-2 text-green-400">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 mr-1" />
                  All set
                </span>
              )}
              {videoUrl && (
                <span className="ml-2 text-slate-500 text-xs">← → to nudge playhead</span>
              )}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[...Array(ranks)].map((_, slot) => {
                const rankNum = ranks - slot;
                return (
                  <MarkerRow
                    key={slot}
                    icon={<span>{rankNum}</span>}
                    time={timestamps[slot]}
                    isNextToBeMark={slot === nextToMark}
                    pendingLabel="Play and press Mark..."
                    onClear={() => clearTimestamp(slot)}
                    onPreview={() => seekTo(timestamps[slot] ?? 0)}
                    accentBg="bg-amber-500 bg-opacity-10 border-amber-500"
                    dotClass="bg-amber-400 text-black"
                  />
                );
              })}

              <MarkerRow
                icon={<FontAwesomeIcon icon={faFlagCheckered} className="w-2.5 h-2.5" />}
                time={endTime}
                isNextToBeMark={true}
                pendingLabel="Play and press Mark End..."
                onClear={clearEnd}
                onPreview={() => seekTo(endTime ?? 0)}
                accentBg="bg-red-900 bg-opacity-20 border-red-700"
                dotClass="bg-red-400 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}