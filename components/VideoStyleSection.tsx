'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faPalette, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { OverlayPreview } from './OverlayPreview'

export function VideoStyleSection({ title, ranks, videoFile } : {title: string, ranks: string[], videoFile: File | null}) {
  const [open, setOpen] = useState(false)
  
  // Single state object for scalability
  const [config, setConfig] = useState({
    stylePreset: 'default',
    titleBackdrop: 'black',
    subtitle: '',
    subtitleColor: '#CCCCCC',
    creatorWatermark: '',
    creatorWatermarkColor: '#FFFFFF',
    titleWordColors: [] as { word: string; color: string }[],
    titleShadowBlur: 25,
    rankShadowBlur: 25,
  })

  const [newWord, setNewWord] = useState('')
  const [newWordColor, setNewWordColor] = useState('#FFD700')

  // Helper to update the nested state
  const updateConfig = (fields: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...fields }))
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
    <div className="rounded-md overflow-hidden border border-slate-700">
      <div className="p-6 bg-slate-950 flex justify-center border-b border-slate-700">
         <OverlayPreview 
            config={config} 
            videoFile={videoFile} 
            title={title} 
            ranks={ranks} 
         />
      </div>
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700 bg-opacity-40 hover:bg-opacity-60 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <FontAwesomeIcon icon={faPalette} className="text-blue-400" />
          Video Style
          <span className="text-slate-500 font-normal">(optional)</span>
        </span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-slate-400 text-xs" />
      </button>

      {/* THE SCALABLE TUNNEL: One hidden input for all settings */}
      <input type="hidden" name="layoutConfig" value={JSON.stringify(config)} />

      {open && (
        <div className="px-4 py-5 bg-slate-800 bg-opacity-30 flex flex-col gap-6">
          
          {/* 1. Style Preset & Backdrop */}
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

          {/* 2. Text Shadows (localized) */}
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

          {/* 3. Subtitle */}
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
              <input 
                type="color" 
                value={config.subtitleColor} 
                onChange={e => updateConfig({ subtitleColor: e.target.value })} 
                className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer" 
              />
            </div>
          </div>

          {/* 4. Creator Watermark */}
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
              <input 
                type="color" 
                value={config.creatorWatermarkColor} 
                onChange={e => updateConfig({ creatorWatermarkColor: e.target.value })} 
                className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer" 
              />
            </div>
          </div>

          {/* 5. Per-Word Title Coloring */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title Word Colors</label>
            
            {/* Tag List */}
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

            {/* Add Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWordColor())}
                placeholder="Specific word to color"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500"
              />
              <input
                type="color"
                value={newWordColor}
                onChange={e => setNewWordColor(e.target.value)}
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
            <p className="text-[10px] text-slate-500 mt-2">
              Tip: Case-insensitive. Words not listed here follow the preset default.
            </p>
          </div>

        </div>
      )}
    </div>
  )
}