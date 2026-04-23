'use client'

import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DeletePost } from "./serverActions/deletepost";
import { useRouter } from "next/navigation"

export function Delete({ id, isMenuMode = false }: { id: string, isMenuMode?: boolean}) {
  const [modalon, setModal] = useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleModal = () => {
    setModal(!modalon);
  }

  const subHandler = async () => {
    setIsDeleting(true);
    try {
        await DeletePost(id);
        router.push("/");
    } catch (err) {
        alert("Failed to delete post");
        setIsDeleting(false);
    }
  }

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={toggleModal} />
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-[90%] max-w-md flex flex-col items-center relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 text-2xl" />
        </div>
        
        <h1 className="text-slate-100 text-2xl font-bold text-center mb-2">Delete Post?</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">This action cannot be undone. All rankings and data associated with this post will be permanently removed.</p>
        
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={subHandler} 
            disabled={isDeleting} 
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white rounded-xl font-bold tracking-normal capitalize text-[13px] transition-all shadow-lg shadow-red-900/20"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </button>
          
          <button 
            onClick={toggleModal} 
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold tracking-normal capitalize text-[13px] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMenuMode ? (
        <button 
          onClick={toggleModal}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 hover:bg-red-500/10 rounded-lg transition-colors group text-left"
        >
          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
          <span className="text-slate-300 text-xs font-bold tracking-normal capitalize group-hover:text-red-400 transition-colors">Delete Post</span>
        </button>
      ) : (
        <button 
          onClick={toggleModal} 
          className="flex items-center justify-center gap-2 border border-red-500/30 rounded-xl px-4 h-10 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[13px] font-bold tracking-normal capitalize transition-all"
        >
          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      )}
      {modalon && mounted && createPortal(modalContent, document.body)}
    </>
  );
}