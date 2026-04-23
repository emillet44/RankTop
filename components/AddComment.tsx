'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { signIn } from "next-auth/react"
import { submitComment, deleteComment } from "./serverActions/commentupload";
import { AddCommentLike } from "./AddCommentLike"
import Image from 'next/image'
import profilepic from '../pfp.png'
import { LoadBatch, LoadReplies } from "./serverActions/loadcomments";
import { faAngleDown, faAngleUp, faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Comment {
  userliked: boolean;
  id: string;
  text: string;
  likes: number;
  date: Date;
  replies: number;
  username: string | null;
  postId: string;
  userId: string;
  parentId?: string | null;
}

const dateCalc = (date: Date) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface CommentUIProps {
  com: Comment;
  isReply?: boolean;
  userid: string;
  currentUsername: string | null | undefined;
  postid: string;
  setActiveReplyInput: (id: string | null) => void;
  activeReplyInput: string | null;
  handleShowReplies: (id: string) => void;
  openReplies: { [key: string]: boolean };
  replies: { [key: string]: Comment[] };
  toggleModal: () => void;
  handleSubmit: (text: string, parentId?: string) => void;
  handleDelete: (commentId: string, parentId?: string) => void;
  replyInputRef: React.RefObject<HTMLSpanElement>;
}

function CommentUI({ 
  com, 
  isReply = false, 
  userid, 
  currentUsername,
  postid, 
  setActiveReplyInput, 
  activeReplyInput, 
  handleShowReplies, 
  openReplies, 
  replies, 
  toggleModal,
  handleSubmit,
  handleDelete,
  replyInputRef
}: CommentUIProps) {
  const canDelete = com.userId === userid || currentUsername === "Cinnamon";

  return (
    <div className={`flex flex-col gap-1.5 ${isReply ? 'pt-3 border-l border-white/5 pl-4' : 'pt-5'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/10">
            <Image src={profilepic} alt="pfp" fill sizes="28px" className="object-cover" />
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-[11px] font-black text-slate-200 tracking-tight">
              {com.username || "Guest"}
            </span>
            <span className="text-[9px] font-bold text-slate-500 tracking-normal capitalize">
              {dateCalc(com.date)}
            </span>
          </div>
        </div>

        {canDelete && (
          <button 
            onClick={() => handleDelete(com.id, com.parentId || undefined)}
            className="text-slate-600 hover:text-red-500 transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <p className="text-[14px] text-slate-300 leading-relaxed pl-9">
        {com.text}
      </p>

      <div className="flex items-center gap-5 pl-9 mt-0.5">
        <AddCommentLike 
          commentid={com.id} 
          postid={postid} 
          userid={userid} 
          likes={com.likes} 
          isliked={com.userliked} 
        />
        <button 
          onClick={() => userid ? setActiveReplyInput(com.id) : toggleModal()}
          className="text-[10px] font-bold text-slate-500 hover:text-slate-300 tracking-normal capitalize transition-colors"
        >
          Reply
        </button>
      </div>

      {activeReplyInput === com.id && (
        <div className="ml-9 mt-2 flex flex-col gap-3">
          <div className="grid">
            <span 
              ref={replyInputRef} 
              contentEditable 
              className="row-start-1 col-start-1 peer text-[14px] text-slate-200 outline-none border-b border-white/10 focus:border-blue-500/50 min-h-[24px] py-1 transition-all" 
            />
            <label className="row-start-1 col-start-1 peer-[&:not(:empty)]:invisible text-[14px] text-slate-500 pointer-events-none py-1">Add a reply...</label>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setActiveReplyInput(null)}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-normal capitalize text-slate-500 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSubmit(replyInputRef.current?.textContent || "", com.id)}
              className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[10px] font-bold tracking-normal capitalize text-blue-400 hover:bg-blue-600/20 transition-all"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {!isReply && (com.replies > 0 || (replies[com.id] && replies[com.id].length > 0)) && (
        <button 
          onClick={() => handleShowReplies(com.id)}
          className="ml-9 mt-1.5 flex items-center gap-2 text-[10px] font-bold text-blue-500/80 tracking-normal capitalize hover:text-blue-400 transition-colors"
        >
          <div className="w-4 h-px bg-blue-500/30" />
          {openReplies[com.id] ? 'Hide' : `Show ${com.replies} ${com.replies === 1 ? 'Reply' : 'Replies'}`}
          <FontAwesomeIcon icon={openReplies[com.id] ? faAngleUp : faAngleDown} className="text-[8px]" />
        </button>
      )}

      {openReplies[com.id] && replies[com.id] && (
        <div className="ml-9 flex flex-col">
          {replies[com.id].map((reply: Comment) => (
            <CommentUI 
              key={reply.id} 
              com={reply} 
              isReply 
              userid={userid}
              currentUsername={currentUsername}
              postid={postid}
              setActiveReplyInput={setActiveReplyInput}
              activeReplyInput={activeReplyInput}
              handleShowReplies={handleShowReplies}
              openReplies={openReplies}
              replies={replies}
              toggleModal={toggleModal}
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              replyInputRef={replyInputRef}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AddComment({ userid, postid, username }: { userid: string, postid: string, username: string | null | undefined }) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const [modalon, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [end, setEnd] = useState(false);
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({});
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const batch = useRef(0);
  const observerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLSpanElement>(null);
  const replyInputRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setOptimisticComments(comments);
  }, [comments]);

  const addComments = useCallback(async () => {
    if (loading || end) return;
    try {
      setLoading(true);
      const newcomments: Comment[] = await LoadBatch(batch.current, "liked", userid, postid);

      if (newcomments.length > 0) {
        setComments(prev => [...prev, ...newcomments]);
        batch.current += 1;
      } else {
        setEnd(true);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [userid, postid, loading, end]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          addComments();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [addComments]);

  const toggleModal = () => setModal(!modalon);

  const handleShowReplies = async (commentid: string) => {
    const isOpening = !openReplies[commentid];
    setOpenReplies(prev => ({ ...prev, [commentid]: isOpening }));
    
    if (isOpening && !replies[commentid]) {
      try {
        const data = await LoadReplies(commentid, userid);
        setReplies(prev => ({ ...prev, [commentid]: data }));
      } catch (error) {
        console.error("Error loading replies:", error);
      }
    }
  }

  const handleDelete = async (commentId: string, parentId?: string) => {
    startTransition(async () => {
      // Optimistic delete
      if (parentId) {
        setReplies(prev => ({
          ...prev,
          [parentId]: prev[parentId].filter(r => r.id !== commentId)
        }));
      } else {
        setOptimisticComments(prev => prev.filter(c => c.id !== commentId));
        setComments(prev => prev.filter(c => c.id !== commentId));
      }

      try {
        await deleteComment(commentId, userid, postid);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete:", error);
        // Error handling: Refreshing is safest to restore state
        router.refresh();
      }
    });
  }

  const handleSubmit = async (text: string, parentId?: string) => {
    if (!userid) {
      toggleModal();
      return;
    }
    if (!text.trim()) return;

    const optimisticCom: Comment = {
      id: Math.random().toString(),
      text: text.trim(),
      userId: userid,
      postId: postid,
      username: username || "You",
      date: new Date(),
      likes: 0,
      replies: 0,
      userliked: false,
      parentId: parentId || null
    };

    startTransition(async () => {
      if (!parentId) {
        setOptimisticComments(prev => [optimisticCom, ...prev]);
      }
      
      try {
        const realCom = await submitComment(userid, postid, username, text.trim(), parentId);
        
        if (parentId) {
          if (replyInputRef.current) replyInputRef.current.textContent = "";
          setActiveReplyInput(null);
          setReplies(prev => ({
            ...prev,
            [parentId]: [realCom, ...(prev[parentId] || [])]
          }));
          setOpenReplies(prev => ({ ...prev, [parentId]: true }));
        } else {
          if (commentInputRef.current) commentInputRef.current.textContent = "";
          setComments(prev => [realCom, ...prev]);
        }
        
        router.refresh();
      } catch (error) {
        console.error("Failed to submit:", error);
        if (!parentId) {
          setOptimisticComments(comments);
        }
      }
    });
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-10 gap-2">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-black text-slate-400 tracking-tight">
          {optimisticComments.length} {optimisticComments.length === 1 ? 'comment' : 'comments'}
        </h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="grid">
          <span 
            ref={commentInputRef} 
            contentEditable 
            onFocus={() => !userid && toggleModal()}
            className="row-start-1 col-start-1 peer text-[15px] text-slate-200 outline-none border-b border-white/10 focus:border-blue-500/50 min-h-[36px] py-1.5 transition-all" 
          />
          <label className="row-start-1 col-start-1 peer-[&:not(:empty)]:invisible text-[15px] text-slate-500 pointer-events-none py-1.5">Add a comment...</label>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={() => handleSubmit(commentInputRef.current?.textContent || "")}
            className="px-6 py-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-xs font-bold tracking-normal capitalize text-blue-400 hover:bg-blue-600/20 transition-all active:scale-95"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-white/5">
        {optimisticComments.map((com: Comment) => (
          <CommentUI 
            key={com.id} 
            com={com} 
            userid={userid}
            currentUsername={username}
            postid={postid}
            setActiveReplyInput={setActiveReplyInput}
            activeReplyInput={activeReplyInput}
            handleShowReplies={handleShowReplies}
            openReplies={openReplies}
            replies={replies}
            toggleModal={toggleModal}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            replyInputRef={replyInputRef}
          />
        ))}
      </div>

      <div ref={observerRef} className="h-16 flex items-center justify-center">
        {loading && (
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 rounded-full bg-slate-600 animate-bounce" />
          </div>
        )}
        {end && !loading && optimisticComments.length > 0 && (
          <span className="text-[9px] font-bold text-slate-600  tracking-[0.2em]">End of conversation</span>
        )}
      </div>

      {modalon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleModal} />
          <div className="relative w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={toggleModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors">
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faXmark} className="w-6 h-6 text-blue-500 rotate-45" />
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">Join the community</h2>
              <p className="text-sm text-slate-400 leading-relaxed px-2">Sign in to leave a comment and engage with others.</p>
              <button 
                onClick={() => signIn(undefined, { callbackUrl: `/post/${postid}` })} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px]  tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
