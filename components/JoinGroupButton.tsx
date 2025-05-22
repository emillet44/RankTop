'use client'

import { useState } from "react";
import { AddToGroup, AddToGroupPass } from "./serverActions/addtogroup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

export function JoinGroup({ userid, groupid, priv, haspass }: { userid: string, groupid: string, priv: boolean, haspass: boolean }) {

  const [loading, setLoading] = useState<boolean | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const addToGroup = async () => {
    setLoading(true);
    const loaded = await AddToGroup(userid, groupid);
    if (loaded) {
      setLoading(false);
    }
  }

  const addToGroupPass = async () => {
    setLoading(true);
    setError('');

    const result = await AddToGroupPass(userid, groupid, password);
    if (result.success) {
      setLoading(false);
      setShowPasswordInput(false);
      setPassword('');
    } 
    else {
      setLoading(null);
      setShowPasswordInput(false);
      setError(result.error || 'Failed to join group');
    }
  }

  const toggleVisibility = () => {
    setVisible(!visible);
    setPasswordType(prev => prev === "password" ? "text" : "password");
  }

  const handleJoinClick = () => {
    if (priv) return;

    if (haspass && !error) {
      setShowPasswordInput(true);
      setError('');
    }
    else if (haspass && error) {
      if (password.trim()) {
        addToGroupPass();
      } else {
        setShowPasswordInput(true);
        setError('');
      }
    }
    else {
      addToGroup();
    }
  }

  const getButtonText = () => {
    if (loading === true) return "Joining...";
    if (loading === false) return "Joined!";
    if (priv) return "Private group";
    return "Join";
  }

  const isButtonDisabled = () => {
    return loading !== null || priv;
  }

  const resetForm = () => {
    setPassword('');
    setError('');
    setShowPasswordInput(true);
  }

  return (
    <div className="mt-4">
      {!(showPasswordInput && loading === null) ? (
        <button onClick={handleJoinClick} disabled={isButtonDisabled()} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed">{getButtonText()}</button>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (password.trim()) addToGroupPass(); }} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input type={passwordType} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus placeholder="Enter password" className="w-full px-3 py-2 pr-8 text-sm bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            <button onClick={toggleVisibility} className="absolute inset-y-0 right-0 px-2 flex items-center text-slate-400 hover:text-slate-200 transition-colors" type="button">
              <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="w-3 h-3" />
            </button>
          </div>
          <button type="submit" disabled={!password.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap">Join</button>
          <button type="button" onClick={() => { setShowPasswordInput(false); setPassword(''); setError(''); }} className="px-2 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">✕</button>
        </form>
      )}
      {error &&
        <p className="text-red-400 text-xs mt-1">
          {error} - <button onClick={resetForm} className="underline hover:no-underline">Try again</button>
        </p>
      }
    </div>
  )
}
