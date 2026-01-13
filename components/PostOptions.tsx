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
}

export default function OptionalSettingsSection({
  settingsToggle,
  onToggleSettingsAction,
  signedin,
  usergroups,
  descref
}: OptionalSettingsSectionProps) {
  return (
    <div className="bg-slate-700 bg-opacity-30 rounded-md">
      <button
        onClick={onToggleSettingsAction}
        className="flex justify-between items-center p-4 w-full text-xl font-semibold"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faCog} className="mr-2 h-5" />
          Optional Settings
        </div>
        <FontAwesomeIcon icon={settingsToggle ? faAngleUp : faAngleDown} className="h-5" />
      </button>
      <div className={`${settingsToggle ? 'block' : 'hidden'} px-4 pb-4 space-y-4 border-t border-slate-600`}>
        {/* Description */}
        <div>
          <label className="block text-lg font-medium mb-2">Description</label>
          <textarea
            ref={descref}
            name="description"
            placeholder="Add a description"
            className="w-full p-3 bg-slate-800 bg-opacity-50 rounded-md outline-none border border-slate-600 focus:border-blue-500 text-white placeholder-slate-400 resize-none"
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-lg font-medium mb-2">Category</label>
          <select
            name="category"
            className="w-full p-3 bg-slate-800 bg-opacity-50 rounded-md outline-none border border-slate-600 focus:border-blue-500 text-white"
          >
            <option className="bg-slate-700 text-offwhite">None</option>
            <option className="bg-slate-700 text-offwhite">Gaming</option>
            <option className="bg-slate-700 text-offwhite">Music</option>
            <option className="bg-slate-700 text-offwhite">Movies</option>
            <option className="bg-slate-700 text-offwhite">TV Shows</option>
            <option className="bg-slate-700 text-offwhite">Tech</option>
            <option className="bg-slate-700 text-offwhite">Sports</option>
            <option className="bg-slate-700 text-offwhite">Memes</option>
            <option className="bg-slate-700 text-offwhite">Fashion</option>
            <option className="bg-slate-700 text-offwhite">Food & Drink</option>
            <option className="bg-slate-700 text-offwhite">Celebrities</option>
            <option className="bg-slate-700 text-offwhite">Lifestyle</option>
            <option className="bg-slate-700 text-offwhite">Books</option>
            <option className="bg-slate-700 text-offwhite">Science & Nature</option>
            <option className="bg-slate-700 text-offwhite">Education</option>
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-lg font-medium mb-2">Visibility</label>
          <select
            name="visibility"
            className="w-full p-3 bg-slate-800 bg-opacity-50 rounded-md outline-none border border-slate-600 focus:border-blue-500 text-white"
            defaultValue="Public"
          >
            <option value="Public" className="bg-slate-700 text-offwhite">Public</option>
            <option value="Private" className="bg-slate-700 text-offwhite">Private</option>
            {signedin && (
              <>
                {usergroups?.memberGroups.map((group: any) => (
                  <option value={group.id} key={group.id} className="bg-slate-700 text-offwhite">
                    {group.name}
                  </option>
                ))}
                {usergroups?.adminGroups.map((group: any) => (
                  <option value={group.id} key={group.id} className="bg-slate-700 text-offwhite">
                    {group.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}