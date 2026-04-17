import React, { memo, useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark, faImage } from "@fortawesome/free-solid-svg-icons"

interface ImageData {
  file: File | null;
  url: string | null;
}

interface ImageUploadSectionProps {
  ranks: number;
  imageData: ImageData[];
  onFileChangeAction: (e: any, index: number) => void;
  onRemoveImageAction: (e: any, index: number) => void;
  onDragStartAction: (e: any, index: number) => void;
  onDragOverAction: (e: any) => void;
  onDropAction: (e: any, index: number) => void;
}

const ImageUploadSection = memo(function ImageUploadSection({
  ranks,
  imageData,
  onFileChangeAction,
  onRemoveImageAction,
  onDragStartAction,
  onDragOverAction,
  onDropAction
}: ImageUploadSectionProps) {
  const [draggingOver, setDraggingOver] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(index);
    onDragOverAction(e);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(null);
    onDropAction(e, index);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Images</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {[...Array(ranks)].map((_, index) => {
          const { url } = imageData[index];
          const isOver = draggingOver === index;

          return (
            <div
              key={index}
              className="space-y-2 group"
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Rank {index + 1}</span>
              </div>

              {url === null && (
                <div className={`relative aspect-square border-2 border-dashed rounded-xl transition-all duration-300
                  ${isOver
                    ? 'border-blue-500/70 bg-blue-500/10 scale-[1.02]'
                    : 'border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => onFileChangeAction(e, index)}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faImage}
                      className={`text-xl transition-colors ${isOver ? 'text-blue-400' : 'text-slate-700 group-hover:text-blue-500/50'}`}
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isOver ? 'text-blue-400' : 'text-slate-600'}`}>
                      {isOver ? 'Drop it!' : 'Upload'}
                    </span>
                  </div>
                </div>
              )}

              {url !== null && (
                <div className={`group/item relative aspect-square border rounded-xl overflow-hidden bg-black shadow-lg transition-all duration-300
                  ${isOver ? 'border-blue-500/70 scale-[1.02] brightness-75' : 'border-white/10'}`}
                >
                  {isOver && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500/20 pointer-events-none">
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Replace</span>
                    </div>
                  )}
                  <Image
                    draggable
                    onDragStart={(e) => onDragStartAction(e, index)}
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors transform scale-75 group-hover/item:scale-100 duration-300 pointer-events-auto"
                      onClick={(e) => onRemoveImageAction(e, index)}
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
    </div>
  );
});

export default ImageUploadSection;