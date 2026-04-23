'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { editList } from "./serverActions/listedit"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faMinus, faArrowRight, faTag, faAlignLeft, faListOl } from "@fortawesome/free-solid-svg-icons"

interface Item {
  text: string;
  note?: string | null;
}

export function CSEditForm({ id, post, startranks }: { id: string, post: any, startranks: number }) {
  const statcats = ["", "Gaming", "Music", "Movies", "TV Shows", "Tech", "Sports", "Memes", "Fashion", "Food & Drink", "Celebrities", "Lifestyle", "Books", "Science & Nature", "Education"];
  const [selected, setSelected] = useState(startranks);
  const [showDescription, setShowDescription] = useState(!!post.description);
  const [category, setCategory] = useState(statcats.includes(post.category) ? post.category : (post.category ? "Custom" : "None"));
  const [lockcat, setLockCat] = useState(statcats.includes(post.category) ? "" : post.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const items = (post.items as any as Item[]) || [];

  const getCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (e.target.value !== "Custom") {
      setLockCat("");
    }
  }

  const toggleDesc = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDescription(!showDescription);
  };

  const lockCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = (e.currentTarget.previousElementSibling as HTMLInputElement).value;
    if (input.trim()) {
      setLockCat(input.trim());
    }
  }

  const changeRank = (delta: number) => {
    setSelected(prev => Math.min(10, Math.max(2, prev + delta)));
  }

  const subHandler = async (formData: FormData) => {
    setIsSubmitting(true);
    if(lockcat !== "") {
      formData.append("category", lockcat);
    }
    else if(category !== "None" && category !== "Custom") {
      formData.append("category", category);
    }
    else {
      formData.append("category", "");
    }

    try {
      const result = await editList(formData, id);
      router.push(`/post/${result}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] text-slate-200">
      <form action={subHandler} className="flex flex-col items-center pt-[130px] md:pt-[82px] px-3 sm:px-6 pb-12 gap-8 w-full">
        <div className="relative overflow-visible p-5 sm:p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md w-full max-w-2xl flex flex-col gap-8 shadow-2xl">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-8 gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight truncate">Edit Post</h1>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-normal capitalize mt-1">Update your rankings and details</p>
            </div>

            {/* Category Selection */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <label className="text-[10px] font-bold text-slate-500 tracking-normal capitalize flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                Category
              </label>
              <div className="flex flex-col gap-2">
                <select 
                  onChange={getCategory} 
                  value={category} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="None" className="bg-slate-900">None</option>
                  {statcats.filter(c => c !== "").map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                  <option value="Custom" className="bg-slate-900">Custom...</option>
                </select>

                {category === "Custom" && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {!lockcat ? (
                      <>
                        <input 
                          maxLength={16} 
                          placeholder="Category name..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500/30 transition-all"
                        />
                        <button 
                          onClick={lockCategory} 
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold  tracking-widest px-3 py-2 rounded-lg transition-all border border-blue-500/20"
                        >
                          Set
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                        <span className="text-xs font-bold text-blue-400  tracking-wider">{lockcat}</span>
                        <button onClick={() => setLockCat("")} className="text-blue-400/50 hover:text-blue-400 transition-colors">
                          <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title and Ranks Section */}
          <div className="space-y-8">
            {/* Title */}
            <div className="relative group">
              <label className="absolute -top-2 left-2 px-1 bg-[#0a0a0a] text-[10px] font-bold text-slate-500 tracking-normal capitalize z-10 flex items-center gap-1.5">
                Title
              </label>
              <textarea 
                name="title" 
                defaultValue={post.title}
                rows={1}
                className="text-xl sm:text-2xl font-bold outline-none w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 placeholder-slate-600 focus:border-blue-500/40 transition-all resize-none overflow-hidden" 
                required 
              />
            </div>

            {/* Ranks Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faListOl} className="text-slate-500 text-xs" />
                <h2 className="text-[11px] font-bold text-slate-400 tracking-normal capitalize">Rankings</h2>
              </div>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden h-8">
                <button
                  type="button"
                  onClick={() => changeRank(-1)}
                  disabled={selected === 2}
                  className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-white/5 disabled:opacity-20 transition-all border-r border-white/10"
                >
                  <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                </button>
                <span className="w-8 h-full flex items-center justify-center text-[11px] font-bold text-slate-200">
                  {selected}
                </span>
                <button
                  type="button"
                  onClick={() => changeRank(1)}
                  disabled={selected === 10}
                  className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-white/5 disabled:opacity-20 transition-all border-l border-white/10"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Rank Items */}
            <div className="space-y-4">
              {[...Array(selected)].map((_, index) => {
                const num = index + 1;
                return (
                  <div key={num} className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="relative flex items-center group w-full">
                      <span className="absolute left-4 text-[10px] font-black text-blue-500/60  tracking-widest">#{num}</span>
                      <input 
                        name={`r${num}`} 
                        defaultValue={items[num-1]?.text || ""} 
                        className="w-full text-base sm:text-lg font-semibold bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-blue-500/30 focus:bg-white/[0.06] transition-all text-slate-200 placeholder-slate-600" 
                        required={num <= 2} 
                        placeholder={`Rank ${num}`}
                      />
                    </div>
                    {showDescription && (
                      <div className="pl-4 flex items-center gap-3 animate-in fade-in duration-300">
                        <div className="w-px h-6 bg-white/10 ml-6" />
                        <input 
                          name={`r${num}_note`} 
                          defaultValue={items[num-1]?.note || ""} 
                          placeholder="Add a quick note..." 
                          className="flex-1 text-xs bg-transparent border-b border-white/5 pb-1 outline-none focus:border-blue-400/30 transition-all text-slate-400 placeholder-slate-700 font-medium" 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleDesc} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold tracking-normal capitalize transition-all ${showDescription ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
              >
                <FontAwesomeIcon icon={faAlignLeft} className="w-3 h-3" />
                {showDescription ? "Ranks: Notes Enabled" : "Ranks: Add Notes"}
              </button>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 tracking-normal capitalize flex items-center gap-2 mb-2 ml-1">
                Post Description (Optional)
              </label>
              <textarea 
                name="description" 
                defaultValue={post.description || ""} 
                placeholder="Share more about this list..."
                className="w-full min-h-[120px] bg-white/[0.02] border border-white/10 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-blue-500/40 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-full py-4 px-6 rounded-xl text-[11px] font-bold tracking-normal capitalize bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-200 transition-all duration-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl text-[11px] font-bold tracking-normal capitalize bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  Save Changes
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
