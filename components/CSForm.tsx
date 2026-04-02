'use client'

import { useRef, useState, useCallback, useEffect } from "react"
import Image from 'next/image'
import { faCircleXmark, faChevronLeft, faChevronRight, faImage, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { signIn } from "next-auth/react"
import VideoPreview from "./VideoPreview"
import PostTypeSelector from "./PostTypeSelect"
import ImageUploadSection from "./ImageUpload"
import VideoInputSection from "./VideoInput"
import OptionalSettingsSection from "./PostOptions"
import { SubmissionOverlay } from "./SubmissionOverlay"
import { VideoStyleSection } from "./VideoStyleSection"

interface ImageData {
  file: File | null;
  url: string | null;
}

interface VideoData {
  file: File | null;
  url: string | null;
  duration?: number;
}

interface Timestamp {
  rankIndex: number;
  time: number;
}

interface PreEditedData {
  file: File | null;
  endTime: number | null;
  timestamps: Timestamp[];
}

export function CSForm({ signedin, username, userid, usergroups }: { signedin: boolean, username: string, userid: string, usergroups: any }) {

  const [ranks, setRanks] = useState(2);
  const [settingsToggle, setSettingsToggle] = useState(false);
  const [showRankNotes, setShowRankNotes] = useState(false);
  const descref = useRef<HTMLTextAreaElement | null>(null);
  const descvalue = useRef("");
  const [image, setImage] = useState(false);
  const [video, setVideo] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');

  const [modalon, setModal] = useState(false);

  const [imageData, setImageData] = useState<ImageData[]>(Array(5).fill({ file: null, url: null }));
  const [videoData, setVideoData] = useState<VideoData[]>(Array(5).fill({ file: null, url: null, duration: 0 }));

  // Keep track of active blob URLs to clean them up properly
  const activeUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentUrls = new Set<string>();
    imageData.forEach(img => { if (img.url) currentUrls.add(img.url); });
    videoData.forEach(vid => { if (vid.url) currentUrls.add(vid.url); });

    // Revoke URLs that are no longer active
    activeUrlsRef.current.forEach(url => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });

    activeUrlsRef.current = currentUrls;
  }, [imageData, videoData]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      activeUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const draggedIndex = useRef<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ title: string; ranks: string[]; images: (string | null)[]; currentIndex: number; }>({ title: '', ranks: ['', '', '', '', ''], images: [null, null, null, null, null], currentIndex: 0 });

  const [videoSessionId, setVideoSessionId] = useState<string | null>(null);
  const [videoFilePaths, setVideoFilePaths] = useState<string[]>([]);
  const [submissionData, setSubmissionData] = useState<{ formData: FormData; videoFiles: File[] } | null>(null);

  const [videoMode, setVideoMode] = useState<'auto' | 'pre-edited'>('auto');
  const [preEditedData, setPreEditedData] = useState<PreEditedData>({ file: null, endTime: null, timestamps: [] });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreviewData(prev => {
      const next = { ...prev };
      if (name === 'title') next.title = value;
      if (name.startsWith('r') && !name.includes('_')) {
        const idx = parseInt(name.replace('r', '')) - 1;
        next.ranks[idx] = value;
      }
      return next;
    });
  }, []);

  const updateImageData = useCallback((index: number, newData: Partial<ImageData>) => {
    setImageData(prevData => {
      const newArray = [...prevData];
      if (index >= 0 && index < newArray.length) newArray[index] = { ...newArray[index], ...newData };
      return newArray;
    });
  }, []);

  const updateVideoData = useCallback((index: number, newData: Partial<VideoData>) => {
    setVideoData(prevData => {
      const newArray = [...prevData];
      if (index >= 0 && index < newArray.length) newArray[index] = { ...newArray[index], ...newData };
      return newArray;
    });
  }, []);

  const handlePreEditedDataChange = useCallback((timestamps: Timestamp[], endTime: number | null, file: File | null) => {
    setPreEditedData({ file, timestamps, endTime });
  }, []);

  const swapImages = useCallback((index1: number, index2: number) => {
    setImageData(prevData => {
      const newData = [...prevData];
      if (index1 >= 0 && index1 < newData.length && index2 >= 0 && index2 < newData.length) {
        [newData[index1], newData[index2]] = [newData[index2], newData[index1]];
      }
      return newData;
    });
  }, []);

  const swapVideos = useCallback((index1: number, index2: number) => {
    setVideoData(prevData => {
      const newData = [...prevData];
      if (index1 >= 0 && index1 < newData.length && index2 >= 0 && index2 < newData.length) {
        [newData[index1], newData[index2]] = [newData[index2], newData[index1]];
      }
      return newData;
    });
  }, []);

  const handleDragStart = useCallback((e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    draggedIndex.current = index;
  }, []);

  const handleDragOver = useCallback((e: any) => { e.preventDefault(); }, []);

  const handleDrop = useCallback((e: any, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex.current !== null && draggedIndex.current !== dropIndex) {
      if (postType === 'image') swapImages(draggedIndex.current, dropIndex);
      else if (postType === 'video') swapVideos(draggedIndex.current, dropIndex);
    }
    draggedIndex.current = null;
  }, [postType, swapImages, swapVideos]);

  const handleFileChange = useCallback((e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) updateImageData(index, { file, url: URL.createObjectURL(file) });
  }, [updateImageData]);

  const handleVideoChange = useCallback((e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => updateVideoData(index, { file, url, duration: v.duration });
      v.src = url;
    }
  }, [updateVideoData]);

  const removeImg = useCallback((e: any, index: number) => { e.preventDefault(); updateImageData(index, { file: null, url: null }); }, [updateImageData]);
  const removeVideo = useCallback((e: any, index: number) => { e.preventDefault(); updateVideoData(index, { file: null, url: null, duration: 0 }); }, [updateVideoData]);
  const toggleSettings = useCallback((e: any) => { e.preventDefault(); setSettingsToggle(prev => !prev); }, []);
  const toggleRankNotes = useCallback((e: any) => { setShowRankNotes(e.target.checked); }, []);

  const canPreview = () => {
    if (postType === 'image') return imageData.filter(img => img.file !== null).length === ranks;
    if (postType === 'video') {
      if (videoMode === 'pre-edited') return preEditedData.file !== null && preEditedData.timestamps.length === ranks;
      return videoData.filter(vid => vid.file !== null).length === ranks;
    }
    return true;
  };

  const subHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!formData.has("category")) formData.append("category", "None");
    formData.append("postType", postType);
    formData.append("username", username);
    formData.append("userid", userid);

    if (descref.current !== null) {
      formData.append("description", descref.current.value);
    } else {
      formData.append("description", descvalue.current);
    }

    if (postType === 'image') {
      imageData.forEach((data, index) => {
        if (data.file !== null) formData.append(`img${index + 1}`, data.file);
      });
    } else if (postType === 'video') {
      formData.append('videoMode', videoMode);
      if (videoMode === 'pre-edited') {
        if (preEditedData.file) formData.append('preEditedVideo', preEditedData.file);
        formData.append('timestamps', JSON.stringify(preEditedData.timestamps));
        if (preEditedData.endTime !== null) formData.append('endTime', String(preEditedData.endTime));
      } else {
        if (videoSessionId && videoFilePaths.length > 0) {
          formData.append('sessionId', videoSessionId);
          formData.append('filePaths', JSON.stringify(videoFilePaths));
        }
      }
    }

    setSubmissionData({
      formData,
      videoFiles: videoMode === 'pre-edited'
        ? (preEditedData.file ? [preEditedData.file] : [])
        : videoData.filter(v => v.file).map(v => v.file as File)
    });
  };

  const toggleImages = (e: any) => {
    e.preventDefault();
    if (postType === 'image') { setPostType('text'); setImage(false); }
    else { setPostType('image'); setImage(true); setVideo(false); }
  }

  const toggleVideos = (e: any) => {
    e.preventDefault();
    if (postType === 'video') { setPostType('text'); setVideo(false); }
    else { setPostType('video'); setVideo(true); setImage(false); }
  }

  const toggleModal = (e: any) => { e.preventDefault(); setModal(!modalon); }

  const changeRank = (delta: number) => {
    setRanks(prev => Math.min(5, Math.max(2, prev + delta)));
  }

  const togglePreview = (e: any) => {
    e.preventDefault();
    if (!showPreview) {
      if (!canPreview()) {
        alert(`Please upload ${ranks} ${postType === 'image' ? 'images' : 'videos'} to match your ranks before previewing.`);
        return;
      }
      updatePreviewData();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowPreview(!showPreview);
  }

  const changePreviewImage = (e: React.MouseEvent<HTMLButtonElement>, direction: "left" | "right"): void => {
    e.preventDefault();
    if (direction === "left" && previewData.currentIndex > 0) setPreviewData(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    else if (direction === "right" && previewData.ranks[previewData.currentIndex + 1]) setPreviewData(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
  };

  const updatePreviewData = (): void => {
    const form = document.getElementById('newpost') as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    setPreviewData({
      title: formData.get('title') as string || '',
      ranks: [formData.get('r1') as string || '', formData.get('r2') as string || '', formData.get('r3') as string || '', formData.get('r4') as string || '', formData.get('r5') as string || ''],
      images: postType === 'image' ? imageData.map(img => img.url) : [],
      currentIndex: 0
    });
  };

  const handleSessionCreated = (sessionId: string, filePaths: string[]) => {
    setVideoSessionId(sessionId);
    setVideoFilePaths(filePaths);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-52px)] text-offwhite overflow-x-hidden">
      <form id="newpost" onSubmit={subHandler} className="flex flex-col items-center pt-[130px] md:pt-[82px] px-3 sm:px-6 pb-12 gap-8 w-full">
        <div className="relative overflow-visible p-5 sm:p-8 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md w-full max-w-2xl flex flex-col">
          <div className="relative overflow-visible flex flex-col">
            <div className={`transition-all duration-300 ease-in-out ${showPreview ? '-translate-x-full opacity-0 h-0 overflow-hidden' : 'translate-x-0 opacity-100'} grid grid-cols-1 gap-8 pt-2`}>
              
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-8 gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight truncate">Create Post</h1>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Share your rankings</p>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ranks</label>
                  <div className="flex items-center bg-white/10 border border-white/10 rounded-lg overflow-hidden h-9">
                    <button 
                      type="button"
                      onClick={() => changeRank(-1)} 
                      disabled={ranks === 2} 
                      className="w-10 h-full flex items-center justify-center text-xl text-slate-300 hover:bg-white/10 disabled:opacity-20 transition-all border-r border-white/10"
                    >
                      <FontAwesomeIcon icon={faMinus} className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 h-full flex items-center justify-center font-bold text-slate-100 bg-white/5">
                      {ranks}
                    </span>
                    <button 
                      type="button"
                      onClick={() => changeRank(1)} 
                      disabled={ranks === 5} 
                      className="w-10 h-full flex items-center justify-center text-xl text-slate-300 hover:bg-white/10 disabled:opacity-20 transition-all border-l border-white/10"
                    >
                      <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Type Selection */}
              <PostTypeSelector postType={postType} signedin={signedin} onToggleVideosAction={toggleVideos} onToggleImagesAction={toggleImages} onToggleModalAction={toggleModal} />

              {/* Title and Ranks Section */}
              <div className="space-y-6">
                <div className="relative group">
                  <label className="absolute -top-2 left-2 px-1 bg-[#0a0a0a] text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">Title</label>
                  <input 
                    name="title" 
                    onBlur={handleInputChange} 
                    placeholder="What are you ranking?" 
                    className="text-lg md:text-2xl font-semibold outline-none w-full bg-white/[0.02] border border-white/15 rounded-xl px-4 py-3 placeholder-slate-600 focus:border-blue-500/50 transition-all" 
                    required 
                    pattern="[^:'\\%{}]*\S[^:'\\%{}]*" 
                    maxLength={40} 
                  />
                </div>

                <div className="space-y-4">
                  {[...Array(ranks)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative flex items-center group w-full">
                        <span className="absolute left-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">#{index + 1}</span>
                        <input 
                          name={`r${index + 1}`} 
                          onBlur={handleInputChange} 
                          placeholder={`Rank ${index + 1}`}
                          className="w-full text-base md:text-xl font-semibold bg-white/[0.05] border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-blue-500/40 focus:bg-white/[0.08] transition-all text-slate-100 placeholder-slate-600" 
                          required 
                          pattern="[^:'\\%{}]*\S[^:'\\%{}]*" 
                          maxLength={80} 
                        />
                      </div>
                      {showRankNotes && (
                        <div className="pl-4 flex items-center gap-3">
                          <div className="w-px h-6 bg-white/20 ml-6" />
                          <input 
                            name={`r${index + 1}_note`} 
                            className="flex-1 text-xs bg-transparent border-b border-white/10 pb-1 outline-none focus:border-blue-400/50 transition-all text-slate-300 placeholder-slate-600" 
                            placeholder="Add a quick note..." 
                            maxLength={50} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Upload Section */}
              {postType === 'video' && (
                <VideoInputSection
                  ranks={ranks}
                  videoData={videoData}
                  videoMode={videoMode}
                  onVideoModeChange={setVideoMode}
                  onVideoChangeAction={handleVideoChange}
                  onRemoveVideoAction={removeVideo}
                  onDragStartAction={handleDragStart}
                  onDragOverAction={handleDragOver}
                  onDropAction={handleDrop}
                  onPreEditedDataChange={handlePreEditedDataChange}
                />
              )}

              {/* ── Video Style (only for video posts) ── */}
              {postType === 'video' &&
                <VideoStyleSection
                  title={previewData.title}
                  ranks={previewData.ranks.slice(0, ranks)}
                  videoFile={videoMode === 'pre-edited' ? preEditedData.file : videoData[0]?.file}
                />
              }

              {/* Image Upload Section */}
              {postType === 'image' && (
                <ImageUploadSection
                  ranks={ranks}
                  imageData={imageData}
                  onFileChangeAction={handleFileChange}
                  onRemoveImageAction={removeImg}
                  onDragStartAction={handleDragStart}
                  onDragOverAction={handleDragOver}
                  onDropAction={handleDrop}
                />
              )}

              {/* Optional Settings */}
              <OptionalSettingsSection
                settingsToggle={settingsToggle}
                onToggleSettingsAction={toggleSettings}
                onToggleRankNotes={toggleRankNotes}
                signedin={signedin}
                usergroups={usergroups}
                descref={descref}
                showRankNotes={showRankNotes}
              />
            </div>

            {/* Preview Section */}
            <div className={`transition-all duration-300 ease-in-out px-0 sm:px-1 ${showPreview ? 'relative translate-x-0 opacity-100' : 'absolute inset-0 translate-x-full opacity-0'}`}>
              <div className="h-full flex flex-col justify-center">
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl text-center font-bold mb-6">Post Preview</h2>
                  <div className="flex w-full">
                    {postType === 'image' && (
                      <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl mx-auto">
                        <header className="text-xl sm:text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">
                          {previewData.title || 'Your Title Here'}
                        </header>
                        <div className="pt-6 pb-6 sm:pt-8 sm:pb-8 rounded-xl outline outline-slate-700 w-full overflow-hidden">
                          <header className="text-lg sm:text-xl text-slate-400 outline-none pb-2 pl-4 sm:pl-8 w-11/12 truncate">
                            {previewData.currentIndex + 1 + ". " + (previewData.ranks[previewData.currentIndex] || 'Your rank here')}
                          </header>
                          <div className="grid grid-cols-[auto,1fr,auto] auto-rows-auto items-center gap-1 sm:gap-2">
                            <button onClick={(e) => changePreviewImage(e, "left")} className="w-8 h-8 flex items-center justify-center" disabled={previewData.currentIndex === 0}>
                              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" style={{ color: previewData.currentIndex === 0 ? '#4a5568' : '#fffff0' }} />
                            </button>
                            <div className="relative aspect-[9/16] sm:h-[341px] bg-black rounded-xl overflow-hidden">
                              {previewData.images && previewData.images[previewData.currentIndex] ? (
                                <Image src={previewData.images[previewData.currentIndex] || ""} alt={`Image ${previewData.currentIndex + 1}`} width={1080} height={1920} className="object-contain w-full h-full" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                  <FontAwesomeIcon icon={faImage} className="w-12 h-12 sm:w-16 sm:h-16" />
                                </div>
                              )}
                            </div>
                            <button onClick={(e) => changePreviewImage(e, "right")} className="w-8 h-8 flex items-center justify-center" disabled={!previewData.ranks[previewData.currentIndex + 1]}>
                              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" style={{ color: !previewData.ranks[previewData.currentIndex + 1] ? '#4a5568' : '#fffff0' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {postType === 'text' && (
                      <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl mx-auto">
                        <header className="text-xl sm:text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">
                          {previewData.title || 'Your Title Here'}
                        </header>
                        <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside list-decimal p-4 sm:p-6 rounded-xl outline outline-slate-700 w-full">
                          <li className="text-lg sm:text-xl text-slate-400 outline-none p-1 sm:p-2 w-11/12 truncate">{previewData.ranks[0] || 'Your first rank here'}</li>
                          <li className="text-lg sm:text-xl text-slate-400 outline-none p-1 sm:p-2 w-11/12 truncate">{previewData.ranks[1] || 'Your second rank here'}</li>
                          <li className={`text-lg sm:text-xl text-slate-400 outline-none p-1 sm:p-2 w-11/12 truncate ${!previewData.ranks[2] ? 'hidden' : ''}`}>{previewData.ranks[2] || ''}</li>
                          <li className={`text-lg sm:text-xl text-slate-400 outline-none p-1 sm:p-2 w-11/12 truncate ${!previewData.ranks[3] ? 'hidden' : ''}`}>{previewData.ranks[3] || ''}</li>
                          <li className={`text-lg sm:text-xl text-slate-400 outline-none p-1 sm:p-2 w-11/12 truncate ${!previewData.ranks[4] ? 'hidden' : ''}`}>{previewData.ranks[4] || ''}</li>
                        </ul>
                      </div>
                    )}

                    {postType === 'video' && (
                      <VideoPreview
                        videoFiles={videoMode === 'pre-edited'
                          ? (preEditedData.file ? [preEditedData.file] : [])
                          : videoData.filter(v => v.file).map(v => v.file as File)}
                        ranks={previewData.ranks.slice(0, ranks)}
                        title={previewData.title}
                        onSessionCreated={handleSessionCreated}
                        videoMode={videoMode}
                        timestamps={preEditedData.timestamps}
                        endTime={preEditedData.endTime}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={togglePreview}
              disabled={!showPreview && !canPreview()}
              className={`w-full py-4 px-6 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                showPreview 
                  ? 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10' 
                  : !canPreview() 
                    ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
              }`}
            >
              {showPreview ? 'Edit Details' : 'Preview Post'}
            </button>
            <button 
              type="submit" 
              disabled={!!submissionData} 
              className="w-full py-4 px-6 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submissionData ? 'Processing...' : 'Create Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Sign In Modal */}
      {modalon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-slate-800 rounded-lg p-1 w-80 flex flex-col items-center">
            <div className="flex w-full justify-end">
              <button onClick={toggleModal}>
                <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
              </button>
            </div>
            <h2 className="text-2xl text-slate-300 font-bold text-center mb-4 px-4">Sign in to enable image and video posts</h2>
            <button onClick={() => signIn(undefined, { callbackUrl: `/newpost` })} className="my-2 w-72 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full">Sign In</button>
          </div>
        </div>
      )}

      {/* Submission tracker */}
      {submissionData && (
        <SubmissionOverlay
          formData={submissionData.formData}
          videoFiles={submissionData.videoFiles}
          postType={postType}
          onClose={() => setSubmissionData(null)}
          previousSessionId={videoSessionId}
          previousFilePaths={videoFilePaths}
        />
      )}
    </div>
  );
}