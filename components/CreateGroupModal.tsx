'use client'

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faXmark, 
  faCheck, 
  faCloudArrowUp, 
  faAngleUp, 
  faAngleDown, 
  faCircleXmark,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { newGroup } from "./serverActions/groupupload";

interface CreateGroupModalProps {
  userid: string;
  onClose: () => void;
}

export function CreateGroupModal({ userid, onClose }: CreateGroupModalProps) {
  const [security, setSecurity] = useState("none");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [profileimage, setProfileImage] = useState<File | null>(null);
  const [profiletoggle, setProfileToggle] = useState(false);
  const [bannerimage, setBannerImage] = useState<File | null>(null);
  const [bannertoggle, setBannerToggle] = useState(false);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [onClose]);

  const toggleVisibility = () => {
    setVisible(!visible);
    setPasswordType(prev => prev === "password" ? "text" : "password");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (e.target.id === "banner") {
        setBannerImage(file);
      } else {
        setProfileImage(file);
      }
    }
  };

  const subHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const formData = new FormData(e.currentTarget);

    formData.append("userid", userid);
    if (profileimage) formData.append("profileimage", profileimage);
    if (bannerimage) formData.append("bannerimage", bannerimage);

    newGroup(formData).then((result) => {
      router.push(`/group/${result}`);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="relative w-full max-w-xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Create New Group</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 transition-colors">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold">Creating your community...</p>
            </div>
          ) : (
            <form id="newgroup" onSubmit={subHandler} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  name="groupname" 
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all" 
                  required 
                  pattern=".*\S.*" 
                  maxLength={40} 
                  placeholder="e.g. Movie Enthusiasts"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex flex-col p-4 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-all has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 group">
                    <input type="radio" name="visibility" value="public" defaultChecked className="absolute top-4 right-4 w-4 h-4 accent-blue-500" />
                    <span className="text-sm font-bold text-white mb-1">Public</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Visible to everyone in search and explore.</span>
                  </label>
                  <label className="relative flex flex-col p-4 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-all has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5 group">
                    <input type="radio" name="visibility" value="private" className="absolute top-4 right-4 w-4 h-4 accent-blue-500" />
                    <span className="text-sm font-bold text-white mb-1">Private</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Hidden. Only joinable via direct code/search.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security</label>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="security" value="none" defaultChecked onChange={(e) => setSecurity(e.target.value)} className="w-4 h-4 accent-blue-500" />
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">None</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="security" value="password" onChange={(e) => setSecurity(e.target.value)} className="w-4 h-4 accent-blue-500" />
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Password</span>
                  </label>
                </div>
              </div>

              {security === "password" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Password</label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={passwordType} 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all pr-12" 
                      required 
                      pattern="\S+" 
                      maxLength={24} 
                      placeholder="Secret access code"
                    />
                    <button type="button" onClick={toggleVisibility} className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                      <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button 
                  type="button" 
                  onClick={() => setProfileToggle(!profiletoggle)} 
                  className="flex justify-between items-center w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all"
                >
                  <span className="text-sm font-bold text-slate-200">Profile Picture</span>
                  <FontAwesomeIcon icon={profiletoggle ? faAngleUp : faAngleDown} className="w-3 h-3 text-slate-500" />
                </button>
                
                {profiletoggle && (
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-4">
                      <div className="group w-20 h-20 bg-white/5 rounded-2xl relative flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-blue-500/50 transition-colors overflow-hidden">
                        {profileimage ? (
                          <>
                            <Image src={URL.createObjectURL(profileimage)} alt="Profile" fill className="object-cover" />
                            <button type="button" className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white" onClick={() => setProfileImage(null)}>
                              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <input id="profile" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                            <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-500 text-xl mb-1" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Upload</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
                        Recommended: Square image, 800x800px. This helps people recognize your community.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => setBannerToggle(!bannertoggle)} 
                  className="flex justify-between items-center w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all"
                >
                  <span className="text-sm font-bold text-slate-200">Banner Image</span>
                  <FontAwesomeIcon icon={bannertoggle ? faAngleUp : faAngleDown} className="w-3 h-3 text-slate-500" />
                </button>

                {bannertoggle && (
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4 animate-in fade-in duration-200">
                    <div className="group w-full h-32 bg-white/5 rounded-2xl relative flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-blue-500/50 transition-colors overflow-hidden">
                      {bannerimage ? (
                        <>
                          <Image src={URL.createObjectURL(bannerimage)} alt="Banner" fill className="object-cover" />
                          <button type="button" className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white" onClick={() => setBannerImage(null)}>
                            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <input id="banner" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                          <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-500 text-2xl mb-2" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Header Image</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Launch Community
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
