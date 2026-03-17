'use client'

import { useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons"

interface OptionalSettingsSectionProps {
  settingsToggle: boolean;
  onToggleSettingsAction: (e: any) => void;
  signedin: boolean;
  usergroups: any;
  descref: React.RefObject<HTMLTextAreaElement>;
  showRankNotes: boolean;
  onToggleRankNotes: (e: any) => void;
}

export default function OptionalSettingsSection({
  settingsToggle,
  onToggleSettingsAction,
  signedin,
  usergroups,
  descref,
  showRankNotes,
  onToggleRankNotes
}: OptionalSettingsSectionProps) {
  return (
    <div className="border border-white/10 bg-white/[0.03] rounded-2xl overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={onToggleSettingsAction}
        className="flex justify-between items-center p-4 sm:p-5 w-full hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faCog} className={`w-3.5 h-3.5 transition-transform duration-500 ${settingsToggle ? 'rotate-90 text-blue-400' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Optional Settings</span>
        </div>
        <FontAwesomeIcon icon={settingsToggle ? faAngleUp : faAngleDown} className="text-slate-500 w-2.5 h-2.5" />
      </button>

      <div className={`transition-all duration-500 ease-in-out ${settingsToggle ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 sm:p-6 pt-2 space-y-8 border-t border-white/10">

          {/* Rank Notes Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Rank Notes</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Add context for each item</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showRankNotes}
                onChange={onToggleRankNotes}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              ref={descref}
              name="description"
              placeholder="Provide more details about this list..."
              className="w-full p-4 bg-white/[0.05] rounded-xl outline-none border border-white/10 focus:border-blue-500/40 text-slate-100 placeholder-slate-600 resize-none transition-all text-sm leading-relaxed"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <select
                  name="category"
                  className="w-full p-3 bg-white/[0.05] rounded-xl outline-none border border-white/10 focus:border-blue-500/40 text-slate-200 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer"
                >
                  <option value="None" className="bg-slate-900">None</option>
                  <option value="Gaming" className="bg-slate-900">Gaming</option>
                  <option value="Music" className="bg-slate-900">Music</option>
                  <option value="Movies" className="bg-slate-900">Movies</option>
                  <option value="TV Shows" className="bg-slate-900">TV Shows</option>
                  <option value="Tech" className="bg-slate-900">Tech</option>
                  <option value="Sports" className="bg-slate-900">Sports</option>
                  <option value="Memes" className="bg-slate-900">Memes</option>
                  <option value="Fashion" className="bg-slate-900">Fashion</option>
                  <option value="Food & Drink" className="bg-slate-900">Food</option>
                  <option value="Celebrities" className="bg-slate-900">Stars</option>
                  <option value="Lifestyle" className="bg-slate-900">Life</option>
                  <option value="Books" className="bg-slate-900">Books</option>
                  <option value="Science & Nature" className="bg-slate-900">Nature</option>
                  <option value="Education" className="bg-slate-900">Learn</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FontAwesomeIcon icon={faAngleDown} className="w-2.5 h-2.5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Visibility</label>
              <div className="relative">
                <select
                  name="visibility"
                  className="w-full p-3 bg-white/[0.05] rounded-xl outline-none border border-white/10 focus:border-blue-500/40 text-slate-200 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer"
                  defaultValue="Public"
                >
                  <option value="Public" className="bg-slate-900">Public</option>
                  <option value="Private" className="bg-slate-900">Private</option>
                  {signedin && (
                    <>
                      {usergroups?.memberGroups.map((group: any) => (
                        <option value={group.id} key={group.id} className="bg-slate-900">
                          {group.name}
                        </option>
                      ))}
                      {usergroups?.adminGroups.map((group: any) => (
                        <option value={group.id} key={group.id} className="bg-slate-900">
                          {group.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FontAwesomeIcon icon={faAngleDown} className="w-2.5 h-2.5 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}