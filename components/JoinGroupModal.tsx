'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faXmark, 
  faEye, 
  faEyeSlash, 
  faMagnifyingGlass,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { FindGroup } from "./serverActions/addtogroup";

interface JoinGroupModalProps {
  userid: string;
  onClose: () => void;
}

export function JoinGroupModal({ userid, onClose }: JoinGroupModalProps) {
  const [passwordType, setPasswordType] = useState("password");
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
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

  const subHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("userid", userid);
    setSubmitted(true);

    FindGroup(formData).then((result: any) => {
      setMessage(result);
    });
  };

  const toggleVisibility = () => {
    setVisible(!visible);
    setPasswordType(prev => prev === "password" ? "text" : "password");
  };

  const resetForm = () => {
    setSubmitted(false);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Join Private Group</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 transition-colors">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-8">
          {!submitted ? (
            <form onSubmit={subHandler} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  name="groupname" 
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all" 
                  required 
                  pattern=".*\S.*" 
                  maxLength={40} 
                  placeholder="The exact community name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Code / Password</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type={passwordType} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all pr-12" 
                    required 
                    pattern="\S+" 
                    maxLength={24} 
                    placeholder="Enter the group password"
                  />
                  <button type="button" onClick={toggleVisibility} className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5" />
                  Request Access
                </button>
              </div>
            </form>
          ) : (
            <div className="py-4 space-y-6">
              {message === "" && (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-bold">Verifying credentials...</p>
                </div>
              )}

              {message === "none" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faXmark} className="text-rose-500 text-2xl" />
                  </div>
                  <h3 className="text-lg font-black text-white">Access Denied</h3>
                  <p className="text-slate-400 text-sm">Incorrect group name or password. Please double-check your invite details.</p>
                  <button onClick={resetForm} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {message === "many" && (
                <div className="text-center space-y-4">
                   <p className="text-slate-200 text-sm leading-relaxed">
                    Multiple groups found with these details. If public, use search; otherwise contact support.
                  </p>
                  <button onClick={resetForm} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors">
                    Back
                  </button>
                </div>
              )}

              {message === "member" && (
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-black text-white">Already a Member</h3>
                  <p className="text-slate-400 text-sm">You're already part of this community.</p>
                  <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl transition-colors">
                    Close
                  </button>
                </div>
              )}

              {message.includes("success") && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">Welcome Aboard!</h3>
                    <p className="text-slate-400 text-sm">You have successfully joined the group.</p>
                  </div>
                  <Link 
                    href={`/group/${message.substring(7)}`} 
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    Enter Community
                    <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {message === "fail" && (
                <div className="text-center space-y-4">
                  <p className="text-rose-400 text-sm">A server error occurred. Please try again.</p>
                  <button onClick={resetForm} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors">
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
