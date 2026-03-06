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
      <div className="rounded-md overflow-hidden border border-slate-700">
        {/* Preview Area */}
        <div className="p-6 bg-slate-950 flex justify-center border-b border-slate-700">
          <OverlayPreview 
              config={config} 
              videoFile={videoFile} 
              title={title} 
              ranks={ranks} 
          />
        </div>

        {/* Toggle Header */}
        <div
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-700 bg-opacity-40 hover:bg-opacity-60 transition-colors text-left cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <FontAwesomeIcon icon={faPalette} className="text-blue-400" />
            Video Style
            <span className="text-slate-500 font-normal">(optional)</span>
          </span>
          
          <div className="flex items-center gap-4">
            {/* Custom styled Reset Trigger */}
            <button
              type="button"
              onClick={handleResetRequest}
              className="group flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-red-400 transition-colors"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-[9px] group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-slate-400 text-xs" />
          </div>
        </div>

        {/* Hidden input for Form submission */}
        <input type="hidden" name="layoutConfig" value={JSON.stringify(config)} />

        {/* Accordion Content */}
        {open && (
          <div className="px-4 py-5 bg-slate-800 bg-opacity-30 flex flex-col gap-6">
            
            {/* Preset & Backdrop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Style Preset</label>
                <select 
                  value={config.stylePreset}
                  onChange={e => updateConfig({ stylePreset: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-2 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="viral">Viral</option>
                  <option value="minimal">Minimal</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title Backdrop</label>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-md border border-slate-700">
                  {['black', 'white', 'blurred'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateConfig({ titleBackdrop: b as any })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                        config.titleBackdrop === b 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shadows */}
            <div className="p-4 bg-slate-900 bg-opacity-40 rounded-lg border border-slate-700">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Text Shadows (Blur Radius)</label>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-16">Title</span>
                  <input 
                    type="range" min="0" max="60" 
                    value={config.titleShadowBlur} 
                    onChange={e => updateConfig({ titleShadowBlur: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-blue-400 w-6 text-right">{config.titleShadowBlur}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-16">Ranks</span>
                  <input 
                    type="range" min="0" max="60" 
                    value={config.rankShadowBlur} 
                    onChange={e => updateConfig({ rankShadowBlur: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-blue-400 w-6 text-right">{config.rankShadowBlur}</span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={e => updateConfig({ subtitle: e.target.value })}
                  placeholder='"subscribe!" or "wait for it..."'
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
                <LazyColorPicker 
                  value={config.subtitleColor} 
                  onChange={val => updateConfig({ subtitleColor: val })} 
                  className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer" 
                />
              </div>
            </div>

            {/* Creator Watermark */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Creator Watermark</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.creatorWatermark}
                  onChange={e => updateConfig({ creatorWatermark: e.target.value })}
                  placeholder="@yourname or YouTube handle"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
                <LazyColorPicker 
                  value={config.creatorWatermarkColor} 
                  onChange={val => updateConfig({ creatorWatermarkColor: val })} 
                  className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer" 
                />
              </div>
            </div>

            {/* Per-Word Coloring */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title Word Colors</label>
              
              {config.titleWordColors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {config.titleWordColors.map(wc => (
                    <span
                      key={wc.word}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700"
                      style={{ color: wc.color }}
                    >
                      {wc.word}
                      <button
                        type="button"
                        onClick={() => removeWordColor(wc.word)}
                        className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWordColor())}
                  placeholder="Specific word to color"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
                <LazyColorPicker
                  value={newWordColor}
                  onChange={val => setNewWordColor(val)}
                  className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <button
                  type="button"
                  onClick={addWordColor}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}