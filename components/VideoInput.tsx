'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faVideo, faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import PreEditedVideoInput from "./PreEditedVideoInput"

interface VideoData {
  file: File | null;
  url: string | null;
  duration?: number;
}

interface Timestamp {
  rankIndex: number;
  time: number;
}

interface VideoUploadSectionProps {
  ranks: number;
  videoData: VideoData[];
  videoMode: 'auto' | 'pre-edited';
  onVideoModeChange: (mode: 'auto' | 'pre-edited') => void;
  onVideoChangeAction: (e: any, index: number) => void;
  onRemoveVideoAction: (e: any, index: number) => void;
  onDragStartAction: (e: any, index: number) => void;
  onDragOverAction: (e: any) => void;
  onDropAction: (e: any, index: number) => void;
  onPreEditedDataChange: (timestamps: Timestamp[], endTime: number | null, file: File | null) => void;
}

export default function VideoUploadSection({
  ranks,
  videoData,
  videoMode,
  onVideoModeChange,
  onVideoChangeAction,
  onRemoveVideoAction,
  onDragStartAction,
  onDragOverAction,
  onDropAction,
  onPreEditedDataChange,
}: VideoUploadSectionProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return videoData.slice(0, ranks).reduce((total, video) => total + (video.duration || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Video Clips</h3>
        </div>

        {/* Mode Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onVideoModeChange('auto')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300
              ${videoMode === 'auto'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            Auto-stitch
          </button>
          <button
            type="button"
            onClick={() => onVideoModeChange('pre-edited')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300
              ${videoMode === 'pre-edited'
                ? 'bg-blue-600 text-white shadow shadow-blue-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            Pre-edited
          </button>
        </div>
      </div>

      {/* Mode description */}
      <div className="px-1">
        <p className="text-xs text-slate-500 font-medium italic">
          {videoMode === 'auto'
            ? "Upload one clip per rank; clips will be stitched for you."
            : "Upload one edited video and mark the start points."}
        </p>
      </div>

      {/* Auto-stitch: existing per-rank upload UI */}
      {videoMode === 'auto' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(ranks)].map((_, index) => {
            const { url, duration } = videoData[index];
            return (
              <div key={index} className="space-y-2 group" onDragOver={onDragOverAction} onDrop={(e) => onDropAction(e, index)}>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Rank {index + 1}</span>
                </div>

                {url === null ? (
                  <div className="relative aspect-video border-2 border-dashed border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all duration-300">
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => onVideoChangeAction(e, index)}
                      required
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faVideo} className="text-2xl text-slate-700 group-hover:text-blue-500/50 transition-colors" />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Select Clip</span>
                    </div>
                  </div>
                ) : (
                  <div className="group/item relative aspect-video border border-white/10 rounded-xl overflow-hidden bg-black shadow-lg">
                    <video draggable onDragStart={(e) => onDragStartAction(e, index)} src={url} className="w-full h-full object-cover" controls={false} muted />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors transform scale-75 group-hover/item:scale-100 duration-300" 
                        onClick={(e) => onRemoveVideoAction(e, index)}
                      >
                        <FontAwesomeIcon icon={faCircleXmark} className="text-xl" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pre-edited: single video + timestamp mapper */}
      {videoMode === 'pre-edited' && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 sm:p-4">
          <PreEditedVideoInput
            ranks={ranks}
            onTimestampsChange={onPreEditedDataChange}
          />
        </div>
      )}
    </div>
  );
}