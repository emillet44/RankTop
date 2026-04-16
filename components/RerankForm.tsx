'use client'

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faXmark, faCheck, faCamera, faPlus } from "@fortawesome/free-solid-svg-icons";

interface RankItem {
  id: string;
  text: string;
  imageUrl: string | null;
  originalIndex: number;
}

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
    /* Uses offset variables so you grab it exactly where you clicked */
    transform: translate3d(
      calc(var(--drag-x, 0px) - var(--offset-x, 0px) + 30px),
      calc(var(--drag-y, 0px) - var(--offset-y, 0px) + 35px),
      0
    ) scale(1.04);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
  .drag-preview.drag-active {
    display: block;
  }
  .drag-preview * {
    transition: none !important;
  }
`;
interface Item {
  text: string;
  note?: string | null;
}

export function RerankForm({ post, id, initialImages }: { post: any, id: string, initialImages?: string[] }) {
  const router = useRouter();

  const [items, setItems] = useState<RankItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const itemRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Stable mutable refs — read inside event handlers without stale closure risk
  const draggedIndexRef = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const rootStyleRef = useRef<CSSStyleDeclaration | null>(null);
  
  // CACHE REFS: This fixes the 20fps layout thrashing issue
  const cachedRowRectsRef = useRef<({ top: number; bottom: number } | null)[]>([]);
  const containerOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Cache the root style object so the hot path never does a DOM query
    rootStyleRef.current = document.documentElement.style;
  }, []);

  useEffect(() => {
    const postItems = (post.items as any as Item[]) || [];
    const initialItems = postItems.map((item, index) => ({
      id: `rank-${index + 1}`,
      text: item.text,
      imageUrl: initialImages?.[index] || null,
      originalIndex: index,
    }));
    setItems(initialItems);
  }, [post, initialImages]);

  // ─── Raw pointermove on window — the fastest possible path ──────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (draggedIndexRef.current === null) return;

    // Two property writes directly to the compositor.
    // We subtract container offset because 'fixed' elements inside containers 
    // with filters (like backdrop-blur) are relative to that container.
    const rs = rootStyleRef.current;
    if (rs) {
      rs.setProperty('--drag-x', `${e.clientX - containerOffsetRef.current.x}px`);
      rs.setProperty('--drag-y', `${e.clientY - containerOffsetRef.current.y}px`);
    }

    // Hit-test rows using CACHED numbers instead of calling getBoundingClientRect()
    const rects = cachedRowRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        if (hoveredIndexRef.current !== i) {
          hoveredIndexRef.current = i;
          setHoveredIndex(i);
        }
        break;
      }
    }
  }, []);

  const startDrag = useCallback((e: React.PointerEvent, index: number) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('label')) return;

    // Capture the pointer
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // Store container offset for the move handler
    containerOffsetRef.current = { x: containerRect.left, y: containerRect.top };

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
        
        // Trigger visual drag state
        draggedIndexRef.current = index;
        hoveredIndexRef.current = index;
        setDraggedIndex(index);
        setHoveredIndex(index);

        const rs = rootStyleRef.current;
        if (rs) {
          // Position relative to container
          rs.setProperty('--drag-x', `${moveEvent.clientX - containerOffsetRef.current.x}px`);
          rs.setProperty('--drag-y', `${moveEvent.clientY - containerOffsetRef.current.y}px`);
          rs.setProperty('--offset-x', `${offsetX}px`);
          rs.setProperty('--offset-y', `${offsetY}px`);
        }

        // CACHE the bounding boxes ONCE at the start of the drag
        cachedRowRectsRef.current = itemRowRefs.current.map(row => {
          if (!row) return null;
          const r = row.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        });

        const preview = dragPreviewRef.current;
        if (preview && containerRef.current) {
          preview.style.width = `${containerRef.current.getBoundingClientRect().width}px`;
          preview.classList.add('drag-active');
        }
      }
    };

    const onUp = (upEvent: PointerEvent) => {
      el.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      // If we didn't drag, it's a click — trigger editing
      if (!dragThresholdTriggered) {
        setEditingIndex(index);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const endDrag = useCallback(() => {
    const from = draggedIndexRef.current;
    const to = hoveredIndexRef.current;

    if (from !== null && to !== null && from !== to) {
      setItems(prev => {
        const next = [...prev];
        const temp = next[from];
        next[from] = next[to];
        next[to] = temp;
        return next;
      });
    }

    draggedIndexRef.current = null;
    hoveredIndexRef.current = null;
    setDraggedIndex(null);
    setHoveredIndex(null);
    dragPreviewRef.current?.classList.remove('drag-active');
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
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], text: newText };
      return next;
    });
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], imageUrl: url };
      return next;
    });
  };

  const handleSave = () => {
    console.log("Saving new order and content:", items);
    alert("Saved!");
    router.back();
  };

  // ─── Card UI ─────────────────────────────────────────────────────────────────

  const RankItemUI = ({
    item, index, isDragged, isHovered, isPreview = false,
  }: {
    item: RankItem;
    index: number;
    isDragged?: boolean;
    isHovered?: boolean;
    isPreview?: boolean;
  }) => (
    <div
      className={`group flex items-center gap-4 p-4 rounded-2xl ${
        isDragged
          ? 'bg-blue-500/5 border border-dashed border-blue-500/30 opacity-30'
          : isHovered
          ? 'bg-blue-500/10 border-2 border-blue-500 scale-[1.01] shadow-lg shadow-blue-500/10'
          : isPreview
          ? 'bg-slate-800 border border-white/20 shadow-2xl'
          : 'bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-150'
      } cursor-grab active:cursor-grabbing select-none`}
    >
      <div className={`flex-none w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border ${isHovered || isPreview ? 'border-blue-500/50' : 'border-white/10'} text-blue-400 font-bold text-sm`}>
        {index + 1}
      </div>

      <div className="flex-none relative w-24 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 group/img">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.text} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faCamera} className="text-slate-700 w-5 h-5" />
          </div>
        )}
        {!isPreview && (
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <FontAwesomeIcon icon={faPlus} className="text-white w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
          </label>
        )}
      </div>

      <div className="flex-grow min-w-0">
        {isPreview ? (
          <div className="w-full text-lg text-slate-100 font-semibold py-1 truncate">{item.text}</div>
        ) : (
          <input
            type="text"
            autoFocus={editingIndex === index}
            value={item.text}
            onBlur={() => setEditingIndex(null)}
            onChange={(e) => handleTextChange(index, e.target.value)}
            className={`w-full bg-transparent border-b border-white/10 focus:border-blue-500/50 outline-none text-lg text-slate-100 font-semibold py-1 transition-all placeholder-slate-600 ${
              editingIndex === index ? 'pointer-events-auto cursor-text' : 'pointer-events-none'
            }`}
            placeholder="Rank item text..."
            style={{ cursor: editingIndex === index ? 'text' : 'inherit' }}
          />
        )}
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">
          Original Position: #{item.originalIndex + 1}
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 relative" ref={containerRef}>
      <style dangerouslySetInnerHTML={{ __html: DRAG_STYLE }} />

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={el => { itemRowRefs.current[index] = el; }}
            className="relative"
          >
            <div
              onPointerDown={(e) => startDrag(e, index)}
              style={{ userSelect: 'none', touchAction: 'none' }}
            >
              <RankItemUI
                item={item}
                index={index}
                isDragged={draggedIndex === index}
                isHovered={hoveredIndex === index && draggedIndex !== index}
              />
            </div>
          </div>
        ))}
      </div>

      <div ref={dragPreviewRef} className="drag-preview">
        {draggedIndex !== null && (
          <div className="w-full rounded-2xl overflow-hidden ring-1 ring-blue-500/30">
            <RankItemUI
              item={items[draggedIndex]}
              index={draggedIndex}
              isPreview
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300"
        >
          <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
          Submit Re-rank
        </button>
      </div>
    </div>
  );
}