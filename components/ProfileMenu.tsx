'use client'

import Image from 'next/image'
import profilepic from '../pfp.png'
import { useState } from 'react'
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function ProfileMenu({ username, userid }: { username: string, userid: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="relative flex-shrink min-w-0 max-w-full z-[110]">
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[-1] cursor-default" 
          onClick={closeMenu} 
        />
      )}

      <button 
        onClick={toggleMenu} 
        className="flex items-center gap-2 hover:outline outline-1 p-1 pr-2 text-sm sm:text-base rounded-md outline-slate-700 bg-white/5 transition-all max-w-[150px] sm:max-w-[200px]"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <Image src={profilepic} alt="pfp" width={32} height={32} className="object-cover" />
        </div>
        <span className="text-offwhite truncate font-medium">@{username}</span>
      </button>

      {menuOpen && (
        <div 
          className="absolute flex flex-col top-12 right-0 w-56 outline outline-1 outline-slate-700 bg-slate-900 rounded-lg text-offwhite py-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-2 border-b border-slate-800 mb-1">
            <p className="text-xs text-slate-500 uppercase font-bold">Account</p>
            <p className="text-sm truncate text-slate-300 italic">#{userid.slice(-8)}</p>
          </div>
          
          <Link href={`/user/${username}`} onClick={closeMenu}>
            <button className="text-left hover:bg-blue-600/20 hover:text-blue-400 px-4 py-2 w-full transition-colors">
              Your Profile
            </button>
          </Link>
          
          <Link href="/username" onClick={closeMenu}>
            <button className="text-left hover:bg-blue-600/20 hover:text-blue-400 px-4 py-2 w-full transition-colors">
              Settings
            </button>
          </Link>

          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="text-left hover:bg-red-600/20 hover:text-red-400 px-4 py-2 w-full transition-colors border-t border-slate-800 mt-1"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}