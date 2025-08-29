'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faVideo, faPlay, faCircleXmark } from "@fortawesome/free-solid-svg-icons"

//Todo at some point: Add support for more video formats

interface VideoData {
  file: File | null;
  url: string | null;
  duration?: number;
}

interface VideoUploadSectionProps {
  ranks: number;
  videoData: VideoData[];
  onVideoChangeAction: (e: any, index: number) => void;
  onRemoveVideoAction: (e: any, index: number) => void;
  onDragStartAction: (e: any, index: number) => void;
  onDragOverAction: (e: any) => void;
  onDropAction: (e: any, index: number) => void;
}

export default function VideoUploadSection({
  ranks,
  videoData,
  onVideoChangeAction,
  onRemoveVideoAction,
  onDragStartAction,
  onDragOverAction,
  onDropAction
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
    <div className="bg-slate-700 bg-opacity-30 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-200">Video Clips</h3>
        {getTotalDuration() > 0 && (
          <span className="text-sm text-slate-300">
            Total: {formatDuration(getTotalDuration())}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(ranks)].map((_, index) => {
          const { url, duration } = videoData[index];
          return (
            <div key={index} className="space-y-2" onDragOver={onDragOverAction} onDrop={(e) => onDropAction(e, index)}>
              <label className="text-lg font-medium">{index + 1}.</label>
              {url === null ? (
                <div className="relative border-2 border-dashed border-blue-500 hover:border-blue-400 rounded-md p-4 h-[120px] bg-blue-900 bg-opacity-10">
                  <input type="file" accept="video/mp4,video/webm,video/ogg" className="absolute inset-0 w-full h-full opacity-0 text-[0px] -indent-10 cursor-pointer z-10" onChange={(e) => onVideoChangeAction(e, index)} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FontAwesomeIcon icon={faVideo} className="h-8 w-8 text-blue-400 mb-2" />
                    <span className="text-blue-200 text-center">Click to upload video clip</span>
                  </div>
                </div>
              ) : (
                <div className="group relative border-2 border-blue-500 rounded-md overflow-hidden bg-black">
                  <video draggable onDragStart={(e) => onDragStartAction(e, index)} src={url} className="w-full h-auto max-h-32 object-cover" controls={false} muted />
                  {duration && duration > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 rounded px-2 py-1">
                      <span className="text-xs text-white">{formatDuration(duration)}</span>
                    </div>
                  )}
                  <button className="invisible group-hover:visible absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1" onClick={(e) => onRemoveVideoAction(e, index)}>
                    <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 rounded-md border border-blue-700">
        <p className="text-sm text-blue-200">
          <FontAwesomeIcon icon={faVideo} className="mr-2" />
          Upload video clips for each rank. They'll be automatically spliced together when you submit. Supported formats: mp4, webm, ogg.
        </p>
      </div>
    </div>
  );
}