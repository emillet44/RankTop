'use client'

import { useRef, useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { faCircleXmark, faChevronLeft, faChevronRight, faImage } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { signIn } from "next-auth/react"
import VideoPreview from "./VideoPreview"
import PostTypeSelector from "./PostTypeSelect"
import ImageUploadSection from "./ImageUpload"
import VideoUploadSection from "./VideoUpload"
import OptionalSettingsSection from "./PostOptions"

interface ImageData {
  file: File | null;
  url: string | null;
}

interface VideoData {
  file: File | null;
  url: string | null;
  duration?: number;
}

export function CSForm({ signedin, username, userid, usergroups }: { signedin: boolean, username: string, userid: string, usergroups: any }) {

  const [ranks, setRanks] = useState(2);
  const [settingsToggle, setSettingsToggle] = useState(false);
  const descref = useRef<HTMLTextAreaElement | null>(null);
  const descvalue = useRef("");
  const [image, setImage] = useState(false);
  const [video, setVideo] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [submitted, setSubmitted] = useState(false);

  const [modalon, setModal] = useState(false);
  const router = useRouter();

  const [imageData, setImageData] = useState<ImageData[]>(Array(5).fill({ file: null, url: null }));
  const [videoData, setVideoData] = useState<VideoData[]>(Array(5).fill({ file: null, url: null, duration: 0 }));
  const draggedIndex = useRef<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ title: string; ranks: string[]; images: (string | null)[];  currentIndex: number; }>({ title: '', ranks: ['', '', '', '', ''], images: [null, null, null, null, null], currentIndex: 0 });

  const updateImageData = (index: number, newData: Partial<ImageData>) => {
    setImageData(prevData => {
      const newArray = [...prevData];
      if (index >= 0 && index < newArray.length) {
        newArray[index] = { ...newArray[index], ...newData };
      }
      return newArray;
    });
  }

  const updateVideoData = (index: number, newData: Partial<VideoData>) => {
    setVideoData(prevData => {
      const newArray = [...prevData];
      if (index >= 0 && index < newArray.length) {
        newArray[index] = { ...newArray[index], ...newData };
      }
      return newArray;
    });
  }

  const swapImages = (index1: number, index2: number) => {
    setImageData(prevData => {
      const newData = [...prevData];
      if (index1 >= 0 && index1 < newData.length && index2 >= 0 && index2 < newData.length) {
        [newData[index1], newData[index2]] = [newData[index2], newData[index1]];
      }
      return newData;
    });
  }

  const swapVideos = (index1: number, index2: number) => {
    setVideoData(prevData => {
      const newData = [...prevData];
      if (index1 >= 0 && index1 < newData.length && index2 >= 0 && index2 < newData.length) {
        [newData[index1], newData[index2]] = [newData[index2], newData[index1]];
      }
      return newData;
    });
  }

  const handleDragStart = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    draggedIndex.current = index;
  }

  const handleDragOver = (e: any) => {
    e.preventDefault();
  }

  const handleDrop = (e: any, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex.current !== null && draggedIndex.current !== dropIndex) {
      if (postType === 'image') {
        swapImages(draggedIndex.current, dropIndex);
      } else if (postType === 'video') {
        swapVideos(draggedIndex.current, dropIndex);
      }
    }
    draggedIndex.current = null;
  }

  const handleFileChange = (e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateImageData(index, { file, url });
    }
  }

  const handleVideoChange = (e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        updateVideoData(index, { file, url, duration: video.duration });
      };
      video.src = url;
    }
  }

  const removeImg = (e: any, index: number) => {
    e.preventDefault();
    updateImageData(index, { file: null, url: null });
  }

  const removeVideo = (e: any, index: number) => {
    e.preventDefault();
    updateVideoData(index, { file: null, url: null, duration: 0 });
  }

  const toggleSettings = (e: any) => {
    e.preventDefault();
    setSettingsToggle(!settingsToggle);
  };

  const subHandler = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    const formData = new FormData(e.currentTarget);

    // Add post type
    formData.append("postType", postType);

    if (postType === 'image') {
      imageData.forEach((data, index) => {
        if (data.file !== null) {
          formData.append(`img${index + 1}`, new Blob([data.file], { type: data.file.type }));
        }
      });
    } else if (postType === 'video') {
      videoData.forEach((data, index) => {
        if (data.file !== null) {
          formData.append(`video${index + 1}`, new Blob([data.file], { type: data.file.type }));
        }
      });
    }

    if (descref.current !== null) {
      formData.append("description", descref.current.value);
    }
    else {
      formData.append("description", descvalue.current);
    }

    formData.append("username", username);
    formData.append("userid", userid);

    // TODO: Call appropriate server action based on postType
    if (postType === 'video') {
      // newVideoList(formData).then((result) => {
      //   router.push(`/post/${result}`);
      // });
      console.log("Video post submission - placeholder");
    } else {
      newList(formData).then((result) => {
        router.push(`/post/${result}`);
      });
    }
  }

  const toggleImages = (e: any) => {
    e.preventDefault();
    if (postType === 'image') {
      setPostType('text');
      setImage(false);
    } else {
      setPostType('image');
      setImage(true);
      setVideo(false);
    }
  }

  const toggleVideos = (e: any) => {
    e.preventDefault();
    if (postType === 'video') {
      setPostType('text');
      setVideo(false);
    } else {
      setPostType('video');
      setVideo(true);
      setImage(false);
    }
  }

  const toggleModal = (e: any) => {
    e.preventDefault();
    setModal(!modalon);
  }

  const changeRank = (e: any) => {
    e.preventDefault();
    if (e.target.textContent == "-") {
      setRanks(ranks - 1);
    }
    else {
      setRanks(ranks + 1);
    }
  }

  const togglePreview = (e: any) => {
    e.preventDefault();
    if (!showPreview) {
      updatePreviewData();
    }
    setShowPreview(!showPreview);
  }

  // Function to handle image navigation in preview
  const changePreviewImage = (e: React.MouseEvent<HTMLButtonElement>, direction: "left" | "right"): void => {
    e.preventDefault();
    if (direction === "left" && previewData.currentIndex > 0) {
      setPreviewData(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    } else if (direction === "right" && previewData.ranks[previewData.currentIndex + 1]) {
      setPreviewData(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };

  // Update preview data when form changes
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

  if (!submitted) {
    return (
      <div className="min-h-screen bg-gradient-radial from-gray-950 to-stone-950 bg-fixed text-offwhite flex flex-col">
        <form id="newpost" onSubmit={subHandler} className="flex flex-col items-center justify-center pt-[130px] md:pt-[82px] px-6 pb-10 gap-6 w-full">
          <div className="relative overflow-visible p-5 rounded-xl shadow-black shadow-lg bg-slate-500 bg-opacity-10 w-full max-w-2xl flex flex-col">
            <div className="relative overflow-visible flex flex-col">
              <div className={`transition-all duration-300 ease-in-out ${showPreview ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'} grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 pt-6`}>
                <div className="flex justify-between items-center mb-2">
                  <header className="text-3xl font-bold">New Post</header>
                  <div className="flex flex-row gap-2">
                    <label htmlFor="rank" className="text-xl font-semibold pr-2">Ranks</label>
                    <div className="flex flex-row outline outline-2 outline-slate-700 rounded-md w-18 h-8 items-center gap-1">
                      <button onClick={changeRank} disabled={ranks === 2} className="text-2xl w-6 bg-slate-50 bg-opacity-5 hover:bg-opacity-10">-</button>
                      <span className="text-xl w-6 py-1 flex justify-center bg-slate-50 bg-opacity-5">{ranks}</span>
                      <button onClick={changeRank} disabled={ranks === 5} className="text-2xl w-6 bg-slate-50 bg-opacity-5 hover:bg-opacity-10">+</button>
                    </div>
                  </div>
                </div>

                {/* Post Type Selection */}
                <PostTypeSelector postType={postType} signedin={signedin} onToggleVideosAction={toggleVideos} onToggleImagesAction={toggleImages} onToggleModalAction={toggleModal} />

                {/* Title and Ranks Section */}
                <div className="bg-slate-700 bg-opacity-30 rounded-md p-4 mt-4">
                  <input name="title" placeholder="Title" className="text-2xl font-semibold outline-none w-full bg-transparent placeholder-slate-400 mb-4" required pattern=".*\S.*" maxLength={40} />
                  {[...Array(ranks)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <label className="text-xl">{index + 1}.</label>
                      <input name={`r${index + 1}`} className="flex-1 text-xl bg-transparent border-b border-transparent outline-none focus:border-blue-500 pb-1 w-11/12" required pattern=".*\S.*" />
                    </div>
                  ))}
                </div>

                {/* Video Upload Section */}
                {postType === 'video' && (
                  <VideoUploadSection ranks={ranks} videoData={videoData} onVideoChangeAction={handleVideoChange} onRemoveVideoAction={removeVideo} onDragStartAction={handleDragStart} onDragOverAction={handleDragOver} onDropAction={handleDrop} />
                )}

                {/* Image Upload Section */}
                {postType === 'image' &&
                  <ImageUploadSection ranks={ranks} imageData={imageData} onFileChangeAction={handleFileChange} onRemoveImageAction={removeImg} onDragStartAction={handleDragStart} onDragOverAction={handleDragOver} onDropAction={handleDrop} />
                }

                {/* Optional Settings */}
                <OptionalSettingsSection settingsToggle={settingsToggle} onToggleSettingsAction={toggleSettings} signedin={signedin} usergroups={usergroups} descref={descref} />
              </div>

              {/* Preview Section */}
              <div className={`absolute inset-0 transition-all duration-300 ease-in-out px-1 ${showPreview ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}> 
                <div className="h-full flex flex-col justify-center">
                  <div>
                    <h2 className="text-3xl text-center font-bold mb-3">Post Preview</h2>

                    {/* Preview Content Based on Post Type */}
                    <div className="flex">
                      {postType === 'image' && (
                        <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl">
                          <header className="text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">
                            {previewData.title || 'Your Title Here'}
                          </header>

                          <div className="pt-8 pb-8 rounded-xl outline outline-slate-700">
                            <header className="text-xl text-slate-400 outline-none pb-2 pl-8 w-11/12">
                              {previewData.currentIndex + 1 + ". " + (previewData.ranks[previewData.currentIndex] || 'Your rank here')}
                            </header>
                            <div className="grid grid-cols-[auto,11fr,auto] auto-rows-auto items-center">
                              <button onClick={(e) => changePreviewImage(e, "left")} className="w-8 h-8" disabled={previewData.currentIndex === 0}>
                                <FontAwesomeIcon icon={faChevronLeft} size="2xl" style={{ color: previewData.currentIndex === 0 ? '#4a5568' : '#fffff0' }} className="pl-0.5" />
                              </button>
                              <div className="relative h-[341px] bg-black rounded-xl">
                                {previewData.images && previewData.images[previewData.currentIndex] ? (
                                  <Image src={previewData.images[previewData.currentIndex] || ""} alt={`Image ${previewData.currentIndex + 1}`} width={1920} height={1080} className="object-contain h-full rounded-md" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-slate-500">
                                    <FontAwesomeIcon icon={faImage} className="h-16 w-16" />
                                  </div>
                                )}
                              </div>
                              <button onClick={(e) => changePreviewImage(e, "right")} className="w-8 h-8" disabled={!previewData.ranks[previewData.currentIndex + 1]}>
                                <FontAwesomeIcon icon={faChevronRight} size="2xl" style={{ color: !previewData.ranks[previewData.currentIndex + 1] ? '#4a5568' : '#fffff0' }} className="pr-0.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {postType === 'text' && (
                        <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl">
                          <header className="text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">
                            {previewData.title || 'Your Title Here'}
                          </header>

                          <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside list-decimal p-4 sm:p-6 rounded-xl outline outline-slate-700">
                            <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{previewData.ranks[0] || 'Your first rank here'}</li>
                            <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{previewData.ranks[1] || 'Your second rank here'}</li>
                            <li className={`text-xl text-slate-400 outline-none p-2 w-11/12 ${!previewData.ranks[2] ? 'hidden' : ''}`}>{previewData.ranks[2] || ''}</li>
                            <li className={`text-xl text-slate-400 outline-none p-2 w-11/12 ${!previewData.ranks[3] ? 'hidden' : ''}`}>{previewData.ranks[3] || ''}</li>
                            <li className={`text-xl text-slate-400 outline-none p-2 w-11/12 ${!previewData.ranks[4] ? 'hidden' : ''}`}>{previewData.ranks[4] || ''}</li>
                          </ul>
                        </div>
                      )}

                      {postType === 'video' && (
                        <VideoPreview 
                          videoFiles={videoData.filter(v => v.file).map(v => v.file as File)}
                          ranks={previewData.ranks.slice(0, ranks)}
                          title={previewData.title}
                        />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-6">
              <button type="button" onClick={togglePreview} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-md text-xl transition-colors">{showPreview ? 'Back to Edit' : 'Preview Post'}</button>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-md text-xl transition-colors">Create Post</button>
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
              <h2 className="text-2xl text-slate-300 font-bold text-center mb-4 px-4">Sign in to add images</h2>
              <button onClick={() => signIn(undefined, { callbackUrl: `/newpost` })} className="my-2 w-72 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full">Sign In</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Submitted state return
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed text-offwhite flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Post Submitted!</h2>
        <p className="text-slate-300">Your post is being processed...</p>
      </div>
    </div>
  );
}