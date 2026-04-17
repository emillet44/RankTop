'use client'

import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faPalette, faPlus, faRotateLeft, faExclamationTriangle, faXmark, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons'
import { OverlayPreview } from './OverlayPreview'

import { DEFAULT_VIDEO_STYLE, VideoLayoutConfig } from '@/lib/video-settings'

// --- 1. DEBOUNCED COLOR PICKER (Optimized performance) ---
function LazyColorPicker({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) {
  const [localColor, setLocalColor] = useState(value)
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalColor(value)
  }, [value])

  // FIX: timeout cleanup must live inside useEffect, not inside the event handler,
  // otherwise the returned cleanup fn is ignored by React and the timer leaks.
  useEffect(() => {
    return () => {
      if (pendingRef.current !== null) clearTimeout(pendingRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setLocalColor(newVal)
    if (pendingRef.current !== null) clearTimeout(pendingRef.current)
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null
      onChange(newVal)
    }, 50)
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

// --- 3. RESET MODAL ---
function ResetConfirmationModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 bg-opacity-80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-6">
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
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            This will revert all video style settings back to the system defaults.
          </p>
          <p className="text-sm font-semibold text-red-400 bg-red-950 bg-opacity-40 p-3 rounded border border-red-800">
            Warning: Your custom per-word title colors will be lost.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white rounded-lg transition-colors border border-slate-700">
            Keep My Styles
          </button>
          <button type="button" onClick={onConfirm} className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-sm font-semibold text-white rounded-lg transition-colors">
            <FontAwesomeIcon icon={faRotateLeft} className="text-xs group-hover:rotate-[-45deg] transition-transform" />
            Yes, Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 4. SECTION DIVIDER ---
function SectionLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      {hint && <span className="text-[9px] text-slate-600 italic">{hint}</span>}
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

// --- 5. MAIN COMPONENT ---
export const VideoStyleSection = memo(function VideoStyleSection({ 
  title, 
  ranks, 
  videoFile,
  onConfigChange
}: { 
  title: string, 
  ranks: string[], 
  videoFile: File | null,
  onConfigChange?: (config: VideoLayoutConfig) => void
}) {
  const [open, setOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [config, setConfig] = useState<VideoLayoutConfig>(DEFAULT_VIDEO_STYLE)
  const [newWord, setNewWord] = useState('')
  const [newWordColor, setNewWordColor] = useState('#FFD700')
  const uploadRef = useRef<HTMLInputElement>(null)

  const updateConfig = (fields: Partial<VideoLayoutConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...fields };
      if (onConfigChange) onConfigChange(next);
      return next;
    })
  }

  const handleResetRequest = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResetModalOpen(true)
  }

  const confirmReset = () => {
    const next = DEFAULT_VIDEO_STYLE;
    setConfig(next)
    if (onConfigChange) onConfigChange(next);
    setNewWord('')
    setIsResetModalOpen(false)
  }

  const downloadConfig = (e: React.MouseEvent) => {
    e.stopPropagation()
    const { titleWordColors, ...configToDownload } = config
    const blob = new Blob([JSON.stringify(configToDownload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ranktop-video-settings-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const uploadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (json && typeof json === 'object') {
          // Robustly merge: Defaults -> JSON -> Exclude titleWordColors (accent words)
          // This ensures any new or optional features in the file are preserved.
          const { titleWordColors: _ignored, ...savedConfig } = json;
          const validConfig: VideoLayoutConfig = {
            ...DEFAULT_VIDEO_STYLE,
            ...savedConfig,
            titleWordColors: DEFAULT_VIDEO_STYLE.titleWordColors, // Keep accent words excluded
          }
          setConfig(validConfig)
          if (onConfigChange) onConfigChange(validConfig);
          setOpen(true)
        }
      } catch (err) {
        console.error("Failed to parse settings file:", err)
        alert("Invalid settings file. Please upload a valid Ranktop JSON configuration.")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
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
    updateConfig({ titleWordColors: config.titleWordColors.filter(wc => wc.word !== word) })
  }

  const RANK_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']

  // Memoize so config doesn't produce a new object
  // on every render — without this, OverlayPreview's React.memo check always fails.
  const previewConfig = useMemo(
    () => config,
    [config]
  )

  return (
    <>
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
      />

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">

        {/* Preview */}
        <div className="p-4 sm:p-8 bg-black/60 flex justify-center border-b border-white/10 relative">
          <OverlayPreview
            config={previewConfig}
            videoFile={videoFile}
            title={title}
            ranks={ranks}
          />
          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-black/70 backdrop-blur-md px-2 py-1 rounded">Live Styling</span>
          </div>
        </div>

        {/* Header */}
        <div
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
            <FontAwesomeIcon icon={faPalette} className={`text-sm transition-colors ${open ? 'text-blue-400' : 'text-slate-500'}`} />
            Video Style
          </span>

          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {/* Upload */}
            <label
              title="Upload settings"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-green-400 hover:bg-white/5 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faUpload} className="text-[11px]" />
              <input ref={uploadRef} type="file" accept=".json" onChange={uploadConfig} className="hidden" />
            </label>
            {/* Download */}
            <button
              type="button"
              title="Download settings"
              onClick={downloadConfig}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-all"
            >
              <FontAwesomeIcon icon={faDownload} className="text-[11px]" />
            </button>
            {/* Reset */}
            <button
              type="button"
              title="Reset to defaults"
              onClick={handleResetRequest}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-[11px]" />
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10 mx-1" onClick={e => e.stopPropagation()} />

            {/* Chevron — clicking this toggles accordion */}
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-[10px]" />
            </button>
          </div>
        </div>

        {/* Hidden input for form submission */}
        <input type="hidden" name="layoutConfig" value={JSON.stringify(config)} />

        {/* Accordion Content — single scrollable layout, no tabs */}
        {open && (
          <div className="px-5 sm:px-7 py-7 border-t border-white/10 space-y-9 bg-white/[0.02]">

            {/* ── SECTION: CANVAS ── */}
            <div>
              <SectionLabel label="Canvas" />
              <div className="space-y-6">

                {/* Backdrop + Font on one row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Title Backdrop</span>
                    <div className="flex gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
                      {['none', 'black', 'white', 'blurred'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => updateConfig({ titleBackdrop: b as any })}
                          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                            config.titleBackdrop === b
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Font</span>
                    <div className="relative">
                      <select
                        value={config.fontFamily}
                        onChange={e => updateConfig({ fontFamily: e.target.value })}
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 outline-none focus:border-blue-500/40 appearance-none cursor-pointer"
                      >
                        <option value="Archivo Expanded Bold" className="bg-slate-900">Archivo Expanded Bold</option>
                        <option value="Arial Regular" className="bg-slate-900">Arial Regular</option>
                        <option value="Rubik Bold" className="bg-slate-900">Rubik Bold</option>
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Shadows & Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Shadow Blur</span>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                      {[
                        { label: 'Title', key: 'titleShadowBlur' as const },
                        { label: 'Rank',  key: 'rankShadowBlur'  as const },
                      ].map(({ label, key }) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-500">{label}</span>
                            <span className="text-[10px] font-mono text-blue-400 tabular-nums w-5 text-right">{config[key]}</span>
                          </div>
                          <input
                            type="range" min="0" max="60" step="5"
                            value={config[key]}
                            onChange={e => updateConfig({ [key]: parseInt(e.target.value) })}
                            className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Font Sizes</span>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                      {[
                        { label: 'Title', key: 'titleFontSize' as const, min: 40, max: 100 },
                        { label: 'Subtitle', key: 'subtitleFontSize' as const, min: 30, max: 100 },
                        { label: 'Rank #',  key: 'rankFontSize'  as const, min: 30, max: 100 },
                        { label: 'Rank Text',  key: 'rankTextFontSize'  as const, min: 30, max: 100 },
                      ].map(({ label, key, min, max }) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-500">{label}</span>
                            <span className="text-[10px] font-mono text-blue-400 tabular-nums w-5 text-right">{config[key] ?? DEFAULT_VIDEO_STYLE[key]}</span>
                          </div>
                          <input
                            type="range" min={min} max={max} step="5"
                            value={config[key] ?? DEFAULT_VIDEO_STYLE[key]}
                            onChange={e => updateConfig({ [key]: parseInt(e.target.value) })}
                            className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl cursor-pointer hover:border-white/[0.12] transition-colors"
                    onClick={() => updateConfig({ textShadow: !config.textShadow })}
                  >
                      <div>
                        <p className="text-[11px] font-bold text-slate-300">Text Outline</p>
                        <p className="text-[9px] text-slate-500">Enable black text borders</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${config.textShadow ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${config.textShadow ? 'left-6' : 'left-1'}`} />
                      </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl cursor-pointer hover:border-white/[0.12] transition-colors"
                    onClick={() => updateConfig({ pushVideoDown: !config.pushVideoDown })}
                  >
                      <div>
                        <p className="text-[11px] font-bold text-slate-300">Push Video Down</p>
                        <p className="text-[9px] text-slate-500">Don&apos;t overlap video with title</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${config.pushVideoDown ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${config.pushVideoDown ? 'left-6' : 'left-1'}`} />
                      </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl cursor-pointer hover:border-white/[0.12] transition-colors"
                    onClick={() => updateConfig({ titleAccentOutline: !config.titleAccentOutline })}
                  >
                      <div>
                        <p className="text-[11px] font-bold text-slate-300">Accent Outline</p>
                        <p className="text-[9px] text-slate-500">Accent words affect outline only</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${config.titleAccentOutline ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${config.titleAccentOutline ? 'left-6' : 'left-1'}`} />
                      </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION: TEXT ── */}
            <div>
              <SectionLabel label="Text Overlays" hint="subtitle · watermark · accent words" />
              <div className="space-y-4">

                {/* Subtitle + Watermark stacked cleanly */}
                {[
                  { label: 'Subtitle', field: 'subtitle' as const, colorField: 'subtitleColor' as const, placeholder: '"subscribe!" or "wait for it..."' },
                  { label: 'Watermark', field: 'creatorWatermark' as const, colorField: 'creatorWatermarkColor' as const, placeholder: '@yourname' },
                ].map(({ label, field, colorField, placeholder }) => (
                  <div key={field} className="flex items-center gap-3">
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-20 shrink-0">{label}</span>
                    <input
                      type="text"
                      value={config[field]}
                      onChange={e => updateConfig({ [field]: e.target.value })}
                      placeholder={placeholder}
                      className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all min-w-0"
                    />
                    <LazyColorPicker
                      value={config[colorField]}
                      onChange={val => updateConfig({ [colorField]: val })}
                      className="w-10 h-10 rounded-xl border border-white/10 bg-white/10 cursor-pointer p-1 shrink-0"
                    />
                  </div>
                ))}

                {/* Accent Words */}
                <div className="pt-1 space-y-3">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Accent Words</span>

                  {/* Existing word pills */}
                  {config.titleWordColors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {config.titleWordColors.map(wc => (
                        <span
                          key={wc.word}
                          className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                          style={{ color: wc.color, borderColor: `${wc.color}40`, background: `${wc.color}12` }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: wc.color }}
                          />
                          {wc.word}
                          <button
                            type="button"
                            onClick={() => removeWordColor(wc.word)}
                            className="ml-0.5 opacity-40 hover:opacity-100 hover:text-red-400 transition-all"
                          >
                            <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add word row */}
                  <div className="flex items-center gap-2">
                    {/* Color swatch that opens the picker — compact */}
                    <label className="relative cursor-pointer shrink-0" title="Pick accent color">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-inner"
                        style={{ background: newWordColor }}
                      />
                      <LazyColorPicker
                        value={newWordColor}
                        onChange={val => setNewWordColor(val)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={newWord}
                      onChange={e => setNewWord(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWordColor())}
                      placeholder="Type a word to highlight…"
                      className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-blue-500/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addWordColor}
                      disabled={!newWord.trim()}
                      className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-90 shrink-0"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION: RANKS ── */}
            <div>
              <SectionLabel label="Rank List" />
              <div className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Row Spacing</span>
                      <span className="text-[10px] font-mono text-blue-400 tabular-nums">{config.rankSpacing}px</span>
                    </div>
                    <input
                      type="range" min="80" max="240" step="5"
                      value={config.rankSpacing}
                      onChange={e => updateConfig({ rankSpacing: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Vertical Offset (Y)</span>
                      <span className="text-[10px] font-mono text-blue-400 tabular-nums">{config.rankYOffset}px</span>
                    </div>
                    <input
                      type="range" min="-100" max="800" step="50"
                      value={config.rankYOffset}
                      onChange={e => updateConfig({ rankYOffset: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl cursor-pointer hover:border-white/[0.12] transition-colors"
                  onClick={() => updateConfig({ matchRankColor: !config.matchRankColor })}
                >
                    <div>
                      <p className="text-[11px] font-bold text-slate-300">Match Text Color</p>
                      <p className="text-[9px] text-slate-500">Apply rank color to label text</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${config.matchRankColor ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${config.matchRankColor ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>

                {/* Rank colors — labeled row, larger swatches */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rank Number Colors</span>
                  <div className="flex flex-wrap gap-3">
                    {config.rankColors.slice(0, ranks.length).map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[40px]">
                        <label className="relative cursor-pointer w-full">
                          <div
                            className="w-full aspect-square rounded-xl border-2 transition-all"
                            style={{ background: color, borderColor: `${color}60` }}
                          />
                          <LazyColorPicker
                            value={color}
                            onChange={val => {
                              const newColors = [...config.rankColors]
                              newColors[i] = val
                              updateConfig({ rankColors: newColors })
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <span className="text-[8px] font-bold text-slate-600 uppercase whitespace-nowrap">{RANK_LABELS[i] || `${i + 1}th`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
})