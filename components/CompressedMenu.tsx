'use client'

import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function CompressedMenu({ username, signedin }: { username: string, signedin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="z-[150] min-[490px]:hidden">
      {/* Trigger Button */}
      <button 
        onClick={toggleMenu} 
        className="absolute right-2 top-1.5 outline-none py-2 px-2 rounded-sm text-offwhite transition-all active:scale-95"
      >
        <FontAwesomeIcon icon={faBars} className="w-8 h-8" style={{ color: "#FFFFF0" }} />
      </button>

      {/* Backdrop */}
      {menuOpen && (
        <div 
          onClick={toggleMenu} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" 
        />
      )}

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-72 transition-transform duration-300 ease-in-out transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Close Button Inside Drawer Area */}
        <button 
          onClick={toggleMenu}
          className="absolute left-[-45px] top-3 p-2 bg-zinc-950 rounded-l-md border-y border-l border-slate-800"
        >
          <FontAwesomeIcon icon={faXmark} className="w-6 h-6" style={{ color: "#FFFFF0" }} />
        </button>

        <div className="flex flex-col h-full w-72 bg-zinc-950 border-l border-slate-800 text-offwhite text-xl px-4 pt-6 gap-4 shadow-2xl">
          {/* Identity Section */}
          {signedin && (
            <div className="border-b border-slate-800 pb-4 mb-2">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Signed in as</p>
              <header className="text-blue-400 font-bold truncate">@{username || 'Guest'}</header>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {signedin && (
              <>
                <Link href={`/user/${username}`} onClick={toggleMenu} className="hover:bg-slate-800 p-2 rounded-md transition-colors">
                  Profile
                </Link>
                <Link href="/username" onClick={toggleMenu} className="hover:bg-slate-800 p-2 rounded-md transition-colors">
                  Settings
                </Link>
              </>
            )}

            <Link href="/groups" onClick={toggleMenu} className="hover:bg-slate-800 p-2 rounded-md transition-colors">
              Groups
            </Link>
            
            <Link href="/newpost" onClick={toggleMenu} className="hover:bg-slate-800 p-2 rounded-md transition-colors">
              New Post
            </Link>
          </div>

          {/* Action Section */}
          <div className="mt-auto pb-10">
            {signedin ? (
              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="w-full text-left text-red-400 hover:bg-red-950/30 p-2 rounded-md transition-colors border-t border-slate-800 pt-4"
              >
                Log Out
              </button>
            ) : (
              <Link href="/signin" onClick={toggleMenu}>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-md font-bold transition-all">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}