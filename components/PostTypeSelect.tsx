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
  const baseClass = "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group";
  const activeClass = "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]";
  const inactiveClass = "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:bg-white/[0.05] hover:text-slate-300";

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Video Post Button */}
      <button 
        type="button" 
        onClick={onToggleVideosAction} 
        className={`${baseClass} ${postType === 'video' ? activeClass : inactiveClass}`}
      >
        <FontAwesomeIcon 
          icon={faVideo} 
          className={`w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110 ${postType === 'video' ? 'text-blue-400' : 'text-slate-600'}`} 
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Video Post</span>
      </button>

      {/* Image Post Button */}
      <button 
        type="button" 
        onClick={signedin ? onToggleImagesAction : onToggleModalAction} 
        className={`${baseClass} ${postType === 'image' ? activeClass : inactiveClass}`}
      >
        <FontAwesomeIcon 
          icon={faImage} 
          className={`w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110 ${postType === 'image' ? 'text-blue-400' : 'text-slate-600'}`} 
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Image Post</span>
      </button>
    </div>
  );
}