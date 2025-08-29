'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"

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

export default function ImageUploadSection({
  ranks,
  imageData,
  onFileChangeAction,
  onRemoveImageAction,
  onDragStartAction,
  onDragOverAction,
  onDropAction
}: ImageUploadSectionProps) {
  return (
    <div className="bg-slate-700 bg-opacity-30 rounded-md p-4">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(ranks)].map((_, index) => {
          const { url } = imageData[index];
          return (
            <div 
              key={index} 
              className="space-y-2" 
              onDragOver={onDragOverAction} 
              onDrop={(e) => onDropAction(e, index)}
            >
              <label className="text-xl">{index + 1}.</label>
              {url === null && (
                <div className="relative border-2 border-dashed border-slate-500 hover:border-blue-500 rounded-md p-2 h-[100px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 text-[0px] -indent-10 cursor-pointer z-10" 
                    onChange={(e) => onFileChangeAction(e, index)} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-slate-400">Click to upload</span>
                  </div>
                </div>
              )}
              {url !== null && (
                <div className="group relative border-2 border-slate-500 rounded-md overflow-hidden">
                  <Image 
                    draggable 
                    onDragStart={(e) => onDragStartAction(e, index)} 
                    src={url} 
                    alt={`Image ${index + 1}`} 
                    width={200} 
                    height={200} 
                    className="w-full h-auto object-cover" 
                  />
                  <button 
                    className="invisible group-hover:visible absolute top-1 right-1" 
                    onClick={(e) => onRemoveImageAction(e, index)}
                  >
                    <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}