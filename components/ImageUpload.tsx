import React, { memo } from 'react'
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Images</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(ranks)].map((_, index) => {
          const { url } = imageData[index];
          return (
            <div 
              key={index} 
              className="space-y-2 group" 
              onDragOver={onDragOverAction} 
              onDrop={(e) => onDropAction(e, index)}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Rank {index + 1}</span>
              </div>

              {url === null && (
                <div className="relative aspect-square border-2 border-dashed border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all duration-300">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => onFileChangeAction(e, index)} 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faImage} className="text-xl text-slate-700 group-hover:text-blue-500/50 transition-colors" />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Upload</span>
                  </div>
                </div>
              )}

              {url !== null && (
                <div className="group/item relative aspect-square border border-white/10 rounded-xl overflow-hidden bg-black shadow-lg">
                  <Image 
                    draggable 
                    onDragStart={(e) => onDragStartAction(e, index)} 
                    src={url} 
                    alt={`Image ${index + 1}`} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors transform scale-75 group-hover/item:scale-100 duration-300" 
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