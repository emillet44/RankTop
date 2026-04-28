'use client'

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faCamera, faPlus } from "@fortawesome/free-solid-svg-icons";
import { SubmissionOverlay } from "./SubmissionOverlay";
import { createPortal } from "react-dom";

interface RankItem {
  id: string;
  text: string;
  imageUrl: string | null;
  imageFile?: File | null;
  originalIndex: number;
  originalText: string;
}

const ITEM_STEP = 100; // 90px height + 10px gap

// ─── CSS injected once at module level ────────────────────────────────────────
const DRAG_STYLE = `
  .drag-preview {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 9999;
    display: none;
    will-change: transform;
    /* Manual offset handling for perfect alignment relative to form */
    transform: translate3d(
      calc(var(--drag-x, 0px) - var(--offset-x, 0px)),
      calc(var(--drag-y, 0px) - var(--offset-y, 0px)),
      0
    );
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    transition: none !important;
  }
  .drag-preview.drag-active {
    display: block;
  }
  .drag-preview * {
    transition: none !important;
  }
  body.grabbing-active, 
  body.grabbing-active *,
  body.grabbing-active input,
  body.grabbing-active button {
    cursor: grabbing !important;
  }
`;

interface Item {
  text: string;
  note?: string | null;
}

export function RerankForm({ post, id, initialImages, existingRerank, onOptimisticUpdate }: { post: any, id: string, initialImages?: string[], existingRerank?: any, onOptimisticUpdate?: (data: any) => void }) {
  const router = useRouter();
  const isFull = post.reRankType === "FULL";

  const [items, setItems] = useState<RankItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [submissionData, setSubmissionData] = useState<FormData | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerRef = useRef<HTMLFormElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const itemRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Stable mutable refs — read inside event handlers without stale closure risk
  const draggedIndexRef = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);

  // CACHE REFS: This fixes the 20fps layout thrashing issue
  const cachedRowRectsRef = useRef<({ top: number; bottom: number } | null)[]>([]);

  const mousePosRef = useRef({ x: 0, y: 0 });
  const loopRafIdRef = useRef<number | null>(null);

  const itemStepRef = useRef<number>(100);

  useEffect(() => {
    const postItems = (post.items as any as Item[]) || [];
    const initialItems = postItems.map((item, index) => ({
      id: `rank-${index + 1}`,
      text: item.text,
      imageUrl: initialImages?.[index] || null,
      originalIndex: index,
      originalText: item.text,
    }));
    setItems(initialItems);
  }, [post, initialImages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingIndex !== null && containerRef.current) {
        const target = e.target as HTMLElement;
        if (!containerRef.current.contains(target)) {
          setEditingIndex(null);
        }
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [editingIndex]);

  const startDragLoop = useCallback(() => {
    const edgeThreshold = 60; // Start scrolling when within 60px of the edge
    const maxScrollSpeed = 15; // Max pixels to scroll per frame

    const loop = () => {
      if (draggedIndexRef.current === null) {
        loopRafIdRef.current = null;
        return;
      }

      const { x: clientX, y: clientY } = mousePosRef.current;

      // 1. Calculate Auto-scroll Delta
      let scrollYDelta = 0;
      if (clientY < edgeThreshold) {
        scrollYDelta = -maxScrollSpeed * (1 - clientY / edgeThreshold);
      } else if (window.innerHeight - clientY < edgeThreshold) {
        const distFromBottom = window.innerHeight - clientY;
        scrollYDelta = maxScrollSpeed * (1 - distFromBottom / edgeThreshold);
      }

      // 2. Apply Boundaries (Safely based on real page height now!)
      if (scrollYDelta !== 0) {
        // Because the preview is fixed, this height is finally accurate
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = Math.max(0, Math.min(window.scrollY + scrollYDelta, maxScroll));
        window.scrollTo(window.scrollX, targetScroll);
      }

      // 3. Update Visual Preview (FIXED element uses screen coordinates)
      const preview = dragPreviewRef.current;
      if (preview) {
        preview.style.setProperty('--drag-x', `${clientX}px`);
        preview.style.setProperty('--drag-y', `${clientY}px`);
      }

      // 4. Hit-Testing (SCROLLING list uses absolute document coordinates)
      const absoluteY = clientY + window.scrollY;
      const rects = cachedRowRectsRef.current;

      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (rect && absoluteY >= rect.top && absoluteY <= rect.bottom) {
          if (hoveredIndexRef.current !== i) {
            hoveredIndexRef.current = i;
            setHoveredIndex(i);
          }
          break;
        }
      }

      // Queue the next frame
      loopRafIdRef.current = requestAnimationFrame(loop);
    };

    if (!loopRafIdRef.current) {
      loopRafIdRef.current = requestAnimationFrame(loop);
    }
  }, []);

  // ─── Raw pointermove on window — the fastest possible path ──────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (draggedIndexRef.current !== null) {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const startDrag = useCallback((e: React.PointerEvent, index: number) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // If this item is already selected, don't start dragging to allow input interaction
    if (editingIndex === index) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('label') || target.closest('input')) return;

    // Capture the pointer
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    const rect = el.getBoundingClientRect();

    // offsetX/Y is the mouse position relative to the element top-left
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Store starting position to detect drag threshold
    const startX = e.clientX;
    const startY = e.clientY;
    let dragThresholdTriggered = false;

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!dragThresholdTriggered && distance > 5) {
        dragThresholdTriggered = true;
        setEditingIndex(null); // Stop editing if we start dragging

        // Apply grabbing class immediately to the body
        document.body.classList.add('grabbing-active');
        // Also apply directly to the captured element to bypass any hover state delays
        el.style.cursor = 'grabbing';

        // Trigger visual drag state
        draggedIndexRef.current = index;
        hoveredIndexRef.current = index;
        setDraggedIndex(index);
        setHoveredIndex(index);

        const preview = dragPreviewRef.current;
        if (preview) {
          preview.style.setProperty('--drag-x', `${moveEvent.clientX}px`);
          preview.style.setProperty('--drag-y', `${moveEvent.clientY}px`);
          preview.style.setProperty('--offset-x', `${offsetX}px`);
          preview.style.setProperty('--offset-y', `${offsetY}px`);

          preview.style.width = `${rect.width}px`;
          preview.classList.add('drag-active');
        }

        mousePosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        startDragLoop();

        // CACHE absolute page coordinates (adding window.scrollY)
        cachedRowRectsRef.current = itemRowRefs.current.map(row => {
          if (!row) return null;
          const r = row.getBoundingClientRect();
          return {
            top: r.top + window.scrollY,
            bottom: r.bottom + window.scrollY
          };
        });

        const rows = itemRowRefs.current;
        if (rows.length > 1 && rows[0] && rows[1]) {
          const rect0 = rows[0].getBoundingClientRect();
          const rect1 = rows[1].getBoundingClientRect();
          itemStepRef.current = rect1.top - rect0.top;
        } else if (rows[0]) {
          // Fallback if there's only 1 item
          itemStepRef.current = rows[0].getBoundingClientRect().height + 10;
        }

      }
    };

    const handleRelease = (releaseEvent: PointerEvent) => {
      // 1. Clean up ALL listeners
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);

      // 2. Only trigger the edit click if it was a normal click (not a drag or a cancel)
      if (!dragThresholdTriggered && isFull && releaseEvent.type !== 'pointercancel') {
        setEditingIndex(index);
      }
    };

    // Attach listeners
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);
  }, [isFull, editingIndex]);

  const endDrag = useCallback(() => {

    if (loopRafIdRef.current !== null) {
      cancelAnimationFrame(loopRafIdRef.current);
      loopRafIdRef.current = null;
    }

    const from = draggedIndexRef.current;
    const to = hoveredIndexRef.current;

    if (from !== null && to !== null && from !== to) {
      setItems(prev => {
        const next = [...prev];
        const [movedItem] = next.splice(from, 1);
        next.splice(to, 0, movedItem);
        return next;
      });
      setIsChanged(true);
    }

    draggedIndexRef.current = null;
    hoveredIndexRef.current = null;
    setDraggedIndex(null);
    setHoveredIndex(null);
    dragPreviewRef.current?.classList.remove('drag-active');
    document.body.classList.remove('grabbing-active');

    // Reset any element-level cursor overrides
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('[onPointerDown]');
      items.forEach(item => (item as HTMLElement).style.cursor = '');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [onPointerMove, endDrag]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleTextChange = (index: number, newText: string) => {
    if (!isFull) return;
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], text: newText };
      return next;
    });
    setIsChanged(true);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFull) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], imageUrl: url, imageFile: file };
      return next;
    });
    setIsChanged(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (existingRerank && !showReplaceModal) {
      setShowReplaceModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("postId", id);
    formData.append("reRankType", post.reRankType);

    const rankMap = items.map(item => {
      // If the text was altered, it's considered a new rank (-1) rather than a movement
      return item.text.trim() === item.originalText.trim() ? item.originalIndex : -1;
    });

    formData.append("rankMap", JSON.stringify(rankMap));

    items.forEach((item, index) => {
      formData.append(`r${index + 1}`, item.text);
      if (item.imageFile) {
        formData.append(`img${index + 1}`, item.imageFile);
      } else if (item.imageUrl) {
        formData.append(`imgUrl${index + 1}`, item.imageUrl);
      }
    });

    if (onOptimisticUpdate) {
      onOptimisticUpdate({
        id: existingRerank?.id || "temp-id",
        items: items.map(item => ({ text: item.text, imageUrl: item.imageUrl })),
        rankMap: rankMap,
        likes: existingRerank?.likes || 0,
        userliked: existingRerank?.userliked || false,
        createdAt: new Date().toISOString()
      });
    }

    setSubmissionData(formData);
    setShowReplaceModal(false);
  };

  // ─── Card UI ─────────────────────────────────────────────────────────────────

  const RankItemUI = ({
    item, index, isDragged, isPreview = false, dragOffset = 0, itemStep = 100
  }: {
    item: RankItem;
    index: number;
    isDragged?: boolean;
    isPreview?: boolean;
    dragOffset?: number;
    itemStep?: number;
  }) => {
    const isSelected = editingIndex === index;

    // Calculate visual rank based on current shift
    const visualRank = isPreview
      ? (hoveredIndex !== null ? hoveredIndex + 1 : index + 1)
      : (index + 1 + Math.round(dragOffset / itemStep));

    return (
      <div
        style={{
          transform: dragOffset !== 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: draggedIndex !== null ? 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), background-color 0.2s, border-color 0.2s, box-shadow 0.2s' : 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s'
        }}
        className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all duration-200 ${isDragged
            ? 'bg-white/5 border-dashed border-white/20 shadow-inner' // The "slot" outline
            : isSelected
              ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/20'
              : isPreview
                ? 'bg-black/80 border-white/20 shadow-2xl backdrop-blur-xl'
                : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/50'
          } ${isSelected ? 'cursor-default select-text' : 'cursor-grab active:cursor-grabbing select-none'}`}
      >
        <div className={`flex items-center gap-4 w-full transition-opacity duration-200 ${isDragged ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`flex-none w-11 h-11 flex items-center justify-center rounded-xl bg-black/40 border ${isPreview || isSelected ? 'border-blue-500/50' : 'border-white/10'} text-blue-400 font-bold text-base transition-colors`}>
            {visualRank}
          </div>

          <div className="flex-none relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 group/img">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.text} fill sizes="96px" className="object-cover" draggable={false} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FontAwesomeIcon icon={faCamera} className="text-slate-700 w-5 h-5" />
              </div>
            )}
            {!isPreview && isFull && (
              <label
                className={`absolute inset-0 bg-black/60 opacity-0 ${isSelected ? 'group-hover/img:opacity-100 pointer-events-auto' : 'pointer-events-none'} flex items-center justify-center cursor-pointer transition-opacity`}
                onClick={(e) => !isSelected && e.preventDefault()}
              >
                <FontAwesomeIcon icon={faPlus} className="text-white w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={!isSelected}
                  onChange={(e) => handleImageChange(index, e)}
                />
              </label>
            )}
          </div>

          <div className="flex-grow min-w-0">
            {isPreview || !isFull ? (
              <div className="w-full text-lg text-slate-100 font-semibold py-1 truncate">{item.text}</div>
            ) : (
              <input
                type="text"
                required
                autoFocus={isSelected}
                value={item.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                className={`w-full bg-transparent border-b ${isSelected ? 'border-blue-500' : 'border-white/10'} focus:border-blue-500 outline-none text-lg text-slate-100 font-semibold py-1 transition-all placeholder-slate-600 ${isSelected ? 'pointer-events-auto cursor-text' : 'pointer-events-none'
                  }`}
                placeholder="Rank item text..."
                onClick={(e) => isSelected && e.stopPropagation()}
              />
            )}
            <div className="text-[11px] font-bold text-slate-500 capitalize mt-1.5 opacity-60">
              Original Position: #{item.originalIndex + 1}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSave} className="space-y-4 relative" ref={containerRef}>
      <style dangerouslySetInnerHTML={{ __html: DRAG_STYLE }} />

      {!isChanged && (
        <p className="text-xs font-bold text-slate-500 tracking-wider animate-pulse text-center mb-1">
          Create your version
        </p>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {items.map((item, index) => {
          const step = itemStepRef.current;
          let dragOffset = 0;
          if (draggedIndex !== null && hoveredIndex !== null) {
            if (index === draggedIndex) {
              // The "slot" placeholder shifts to the target position
              dragOffset = (hoveredIndex - draggedIndex) * step;
            } else {
              const isBetween = (index >= hoveredIndex && index < draggedIndex) || (index <= hoveredIndex && index > draggedIndex);
              if (isBetween) {
                if (draggedIndex > hoveredIndex) {
                  dragOffset = step;
                } else {
                  dragOffset = -step;
                }
              }
            }
          }

          return (
            <div
              key={item.id}
              ref={el => { itemRowRefs.current[index] = el; }}
              className="relative"
              style={{ zIndex: draggedIndex === index ? 20 : 1 }}
            >
              <div
                onPointerDown={(e) => startDrag(e, index)}
                style={{
                  userSelect: editingIndex === index ? 'text' : 'none',
                  touchAction: editingIndex === index ? 'auto' : 'none'
                }}
              >
                <RankItemUI
                  item={item}
                  index={index}
                  isDragged={draggedIndex === index}
                  dragOffset={dragOffset}
                  itemStep={step}
                />
              </div>
            </div>
          );
        })}
      </div>

      {mounted && createPortal(
        <div ref={dragPreviewRef} className="drag-preview">
          {draggedIndex !== null && (
            <RankItemUI
              item={items[draggedIndex]}
              index={draggedIndex}
              isPreview
            />
          )}
        </div>,
        document.body
      )}

      {isChanged && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={() => {
                const postItems = (post.items as any as Item[]) || [];
                const initialItems = postItems.map((item, index) => ({
                  id: `rank-${index + 1}`,
                  text: item.text,
                  imageUrl: initialImages?.[index] || null,
                  originalIndex: index,
                  originalText: item.text,
                }));
                setItems(initialItems);
                setIsChanged(false);
              }}
              disabled={!!submissionData}
              className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[13px] font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="submit"
              disabled={!!submissionData}
              className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[13px] font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 ${
                existingRerank 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              }`}
            >
              <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              {submissionData ? "Processing..." : existingRerank ? "Replace Re-rank" : "Submit Re-rank"}
            </button>
          </div>
        </div>
      )}

      {showReplaceModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReplaceModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faXmark} className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">Replace Re-ranking?</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                You already have a re-ranking for this post. Replacing it will <span className="text-rose-500 font-bold">permanently delete</span> your current re-ranking and all its likes.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => handleSave()}
                  className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98]"
                >
                  Yes, Replace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submissionData && (
        <SubmissionOverlay
          formData={submissionData}
          videoFiles={[]}
          postType="rerank"
          onClose={() => setSubmissionData(null)}
          onComplete={(newId) => {
            setSubmissionData(null);
            setIsChanged(false);
            if (onOptimisticUpdate) {
              const currentRankMap = items.map(item => 
                item.text.trim() === item.originalText.trim() ? item.originalIndex : -1
              );

              onOptimisticUpdate({
                id: newId,
                items: items.map(item => ({ text: item.text, imageUrl: item.imageUrl })),
                rankMap: currentRankMap,
                likes: existingRerank?.likes || 0,
                userliked: existingRerank?.userliked || false,
                createdAt: new Date().toISOString()
              });
            }
          }}
        />
      )}
    </form>
  );
}
