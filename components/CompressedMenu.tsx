'use client'

import { faBars, faXmark, faUser, faGear, faUsers, faPlus, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function CompressedMenu({ username, signedin }: { username: string, signedin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="md:hidden flex items-center">
      {/* Trigger Button */}
      <button 
        onClick={toggleMenu} 
        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-offwhite transition-colors"
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {menuOpen && (
        <div 
          onClick={toggleMenu} 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] transition-opacity duration-300" 
        />
      )}

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-[280px] bg-black border-l border-white/10 z-[210] transition-transform duration-300 ease-in-out transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          {/* Header Area */}
          <div className="flex items-center justify-end mb-6">
            <button 
              onClick={toggleMenu}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-offwhite transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>

          {/* Identity Section */}
          {signedin && (
            <div className="mb-8 px-4">
              <p className="text-[10px] text-slate-500 font-bold tracking-normal capitalize mb-1">Account</p>
              <header className="text-offwhite font-bold truncate text-lg">@{username}</header>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {signedin && (
              <>
                <Link 
                  href={`/user/${username}`} 
                  onClick={toggleMenu} 
                  className="h-11 flex items-center px-4 rounded-lg text-slate-400 hover:text-offwhite hover:bg-white/5 transition-all font-bold tracking-normal capitalize text-[11px] group"
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  My Profile
                </Link>
                <Link 
                  href="/username" 
                  onClick={toggleMenu} 
                  className="h-11 flex items-center px-4 rounded-lg text-slate-400 hover:text-offwhite hover:bg-white/5 transition-all font-bold tracking-normal capitalize text-[11px] group"
                >
                  <FontAwesomeIcon icon={faGear} className="w-4 h-4 mr-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  Settings
                </Link>
                <div className="h-px bg-white/5 my-4 mx-4" />
              </>
            )}

            <Link 
              href="/groups" 
              onClick={toggleMenu} 
              className="h-11 flex items-center px-4 rounded-lg text-slate-300 hover:text-offwhite hover:bg-white/5 transition-all font-bold tracking-normal capitalize text-[11px] group"
            >
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
              Groups
            </Link>
            
            <Link 
              href="/newpost" 
              onClick={toggleMenu} 
              className="h-11 mt-4 flex items-center px-4 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all font-bold tracking-normal capitalize text-[11px] group"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
              New Post
            </Link>
          </nav>

          {/* Action Section */}
          <div className="mt-auto pt-6 border-t border-white/5">
            {signedin ? (
              <button 
                onClick={() => {
                  toggleMenu();
                  signOut({ callbackUrl: "/" });
                }} 
                className="w-full h-11 flex items-center justify-center rounded-lg text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold tracking-normal capitalize text-[11px]"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </button>
            ) : (
              <Link href="/signin" onClick={toggleMenu} className="block">
                <button className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all tracking-normal capitalize text-[11px]">
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
