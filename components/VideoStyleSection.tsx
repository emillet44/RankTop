'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faPalette, faPlus, faTrash, faRotateLeft, faExclamationTriangle, faXmark } from '@fortawesome/free-solid-svg-icons'
import { OverlayPreview } from './OverlayPreview'

// --- 1. DEBOUNCED COLOR PICKER (Optimized performance) ---
function LazyColorPicker({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) {
  const [localColor, setLocalColor] = useState(value)

  useEffect(() => {
    setLocalColor(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setLocalColor(newVal)
    
    // Canvas redraws are heavy, so debounce this update
    const timeout = setTimeout(() => {
      onChange(newVal)
    }, 50)
    return () => clearTimeout(timeout)
  }

  return (
    <input 
      type="color" 
      value={localColor} 
      onChange={handleChange} 
      className={className} 
    />
  )
}

// --- 2. DEFAULTS (Mirrored from server script) ---
const DEFAULT_STYLE = {
  stylePreset: 'default',
  titleBackdrop: 'black',
  subtitle: '',
  subtitleColor: '#CCCCCC',
  creatorWatermark: '',
  creatorWatermarkColor: '#FFFFFF',
  titleWordColors: [] as { word: string; color: string }[],
  titleShadowBlur: 25,
  rankShadowBlur: 5, 
  rankColors: ['#FFD700', '#C0C0C0', '#CD7F32', 'white', 'white'],
}

// --- 3. CUSTOM MODAL COMPONENT (Professional UI) ---
function ResetConfirmationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 bg-opacity-80 backdrop-blur-sm transition-opacity">
      {/* Backdrop (clickable to close) */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-6 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-950 flex items-center justify-center border border-red-700">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Reset Video Styles?</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            This will revert all video style settings—presets, backdrops, shadows, subtitles, and watermarks—back to the system defaults.
          </p>
          <p className="text-sm font-semibold text-red-400 bg-red-950 bg-opacity-40 p-3 rounded border border-red-800">
            Warning: Your custom per-word title colors will be lost.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white rounded-lg transition-colors border border-slate-700"
          >
            Keep My Styles
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-sm font-semibold text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="text-xs group-hover:rotate-[-45deg] transition-transform" />
            Yes, Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 4. MAIN COMPONENT ---
export function VideoStyleSection({ title, ranks, videoFile } : {title: string, ranks: string[], videoFile: File | null}) {
  const [open, setOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  
  const [config, setConfig] = useState(DEFAULT_STYLE)
  const [newWord, setNewWord] = useState('')
  const [newWordColor, setNewWordColor] = useState('#FFD700')

  const updateConfig = (fields: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...fields }))
  }

  // Triggered by the "Reset" button in the header
  const handleResetRequest = (e: React.MouseEvent) => {
    e.stopPropagation() // Stop accordion from toggling
    setIsResetModalOpen(true) // Open custom modal
  }

  // Final confirmation from inside the modal
  const confirmReset = () => {
    setConfig(DEFAULT_STYLE)
    setNewWord('')
    setIsResetModalOpen(false) // Close modal
  }

  const addWordColor = () => {
    const trimmed = newWord.trim()
    if (!trimmed) return
    const newColors = [
      ...config.titleWordColors.filter(wc => wc.word.toLowerCase() !== trimmed.toLowerCase()),
      { word: trimmed, color: newWordColor }
    ]
    updateConfig({ titleWordColors: newColors })
    setNewWord('')
  }

  const removeWordColor = (word: string) => {
    const newColors = config.titleWordColors.filter(wc => wc.word !== word)
    updateConfig({ titleWordColors: newColors })
  }

  return (
    <>
      {/* 1. Reset Confirmation Modal */}
      <ResetConfirmationModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        onConfirm={confirmReset} 
      />

      {/* 2. Main Section Container */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
        {/* Preview Area */}
        <div className="p-4 sm:p-8 bg-black/60 flex justify-center border-b border-white/10 relative group/preview">
          <OverlayPreview 
              config={config} 
              videoFile={videoFile} 
              title={title} 
              ranks={ranks} 
          />
          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-black/70 backdrop-blur-md px-2 py-1 rounded">Live Styling</span>
          </div>
        </div>

        {/* Toggle Header */}
        <div
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.05] transition-colors text-left cursor-pointer"
        >
          <span className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            <FontAwesomeIcon icon={faPalette} className={`text-sm transition-colors ${open ? 'text-blue-400' : 'text-slate-500'}`} />
            Video Style
          </span>
          
          <div className="flex items-center gap-4">
            {/* Custom styled Reset Trigger */}
            <button
              type="button"
              onClick={handleResetRequest}
              className="group flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 hover:text-red-400 transition-colors"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-[8px] group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-slate-500 text-[10px]" />
          </div>
        </div>

        {/* Hidden input for Form submission */}
        <input type="hidden" name="layoutConfig" value={JSON.stringify(config)} />

        {/* Accordion Content */}
        {open && (
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-t border-white/10 space-y-8 bg-white/[0.02]">
            
            {/* Preset & Backdrop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Style Preset</label>
                <div className="relative">
                  <select 
                    value={config.stylePreset}
                    onChange={e => updateConfig({ stylePreset: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                  >
                    <option value="default" className="bg-slate-900">Default</option>
                    <option value="viral" className="bg-slate-900">Viral</option>
                    <option value="minimal" className="bg-slate-900">Minimal</option>
                    <option value="dark" className="bg-slate-900">Dark</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-slate-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title Backdrop</label>
                <div className="flex gap-1 bg-white/10 p-1 rounded-xl border border-white/10 h-[46px]">
                  {['black', 'white', 'blurred'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateConfig({ titleBackdrop: b as any })}
                      className={`flex-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                        config.titleBackdrop === b 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shadows */}
            <div className="p-4 sm:p-6 bg-white/[0.03] rounded-xl border border-white/10 space-y-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shadow Intensity</label>
              <div className="space-y-6">
                <div className="flex items-center gap-3 sm:gap-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight w-12">Title</span>
                  <input 
                    type="range" min="0" max="60" 
                    value={config.titleShadowBlur} 
                    onChange={e => updateConfig({ titleShadowBlur: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-blue-400 w-4 text-right">{config.titleShadowBlur}</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight w-12">Ranks</span>
                  <input 
                    type="range" min="0" max="60" 
                    value={config.rankShadowBlur} 
                    onChange={e => updateConfig({ rankShadowBlur: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-blue-500 w-4 text-right">{config.rankShadowBlur}</span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subtitle Overlay</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={e => updateConfig({ subtitle: e.target.value })}
                  placeholder='"subscribe!" or "wait for it..."'
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all"
                />
                <div className="relative group/color">
                  <LazyColorPicker 
                    value={config.subtitleColor} 
                    onChange={val => updateConfig({ subtitleColor: val })} 
                    className="w-11 h-11 rounded-xl border border-white/10 bg-white/10 cursor-pointer p-1" 
                  />
                </div>
              </div>
            </div>

            {/* Creator Watermark */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Watermark</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={config.creatorWatermark}
                  onChange={e => updateConfig({ creatorWatermark: e.target.value })}
                  placeholder="@yourname"
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all"
                />
                <LazyColorPicker 
                  value={config.creatorWatermarkColor} 
                  onChange={val => updateConfig({ creatorWatermarkColor: val })} 
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/10 cursor-pointer p-1" 
                />
              </div>
            </div>

            {/* Per-Word Coloring */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title Accent Words</label>
                <span className="text-[9px] text-slate-500 font-medium italic">Type word & press enter</span>
              </div>
              
              {config.titleWordColors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-white/[0.04] border border-white/10 rounded-xl">
                  {config.titleWordColors.map(wc => (
                    <span
                      key={wc.word}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black border border-white/10"
                      style={{ color: wc.color, borderColor: `${wc.color}30` }}
                    >
                      {wc.word}
                      <button
                        type="button"
                        onClick={() => removeWordColor(wc.word)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWordColor())}
                  placeholder="Specific word..."
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all"
                />
                <LazyColorPicker
                  value={newWordColor}
                  onChange={val => setNewWordColor(val)}
                  className="w-11 h-11 rounded-xl border border-white/10 bg-white/10 cursor-pointer p-1"
                />
                <button
                  type="button"
                  onClick={addWordColor}
                  className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-90"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}