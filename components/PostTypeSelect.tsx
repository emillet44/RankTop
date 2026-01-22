'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faVideo, faImage } from "@fortawesome/free-solid-svg-icons"

interface PostTypeSelectorProps {
  postType: 'text' | 'image' | 'video';
  signedin: boolean;
  onToggleVideosAction: (e: any) => void;
  onToggleImagesAction: (e: any) => void;
  onToggleModalAction: (e: any) => void;
}

export default function PostTypeSelector({ 
  postType, 
  signedin, 
  onToggleVideosAction, 
  onToggleImagesAction, 
  onToggleModalAction 
}: PostTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {signedin ? (
        <>
          <button 
            type="button" 
            onClick={onToggleVideosAction} 
            className={`flex justify-center items-center p-3 outline outline-2 rounded-md text-lg font-semibold transition-all ${
              postType === 'video' 
                ? 'outline-blue-500 bg-blue-900 bg-opacity-40 text-blue-200' 
                : 'outline-slate-700 bg-slate-50 bg-opacity-5 hover:bg-opacity-10'
            }`}
          >
            <FontAwesomeIcon icon={faVideo} className="mr-2 h-5" />
            Video Post
          </button>
          <button 
            type="button" 
            onClick={onToggleImagesAction} 
            className={`flex justify-center items-center p-3 outline outline-2 rounded-md text-lg font-semibold transition-all ${
              postType === 'image' 
                ? 'outline-blue-500 bg-blue-900 bg-opacity-40 text-blue-200' 
                : 'outline-slate-700 bg-slate-50 bg-opacity-5 hover:bg-opacity-10'
            }`}
          >
            <FontAwesomeIcon icon={faImage} className="mr-2 h-5" />
            Image Post
          </button>
        </>
      ) : (
        <>
          <button 
            type="button" 
            onClick={onToggleVideosAction}
            className="flex justify-center items-center p-3 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 text-lg font-semibold"
          >
            <FontAwesomeIcon icon={faVideo} className="mr-2 h-5" />
            Video Post
          </button>
          <button 
            type="button" 
            onClick={onToggleModalAction} 
            className="flex justify-center items-center p-3 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 text-lg font-semibold"
          >
            <FontAwesomeIcon icon={faImage} className="mr-2 h-5" />
            Image Post
          </button>
        </>
      )}
    </div>
  );
}