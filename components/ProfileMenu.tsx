'use client'

import Image from 'next/image'
import profilepic from '../pfp.png'
import { useEffect, useRef, useState } from 'react'
import { AddUsername } from './AddUsername';
import { signOut } from 'next-auth/react';

//This button displays the username and eventually it will display the profile picture of users(for now its a default image). menuOpen is used to toggle the drawer either through the
//button or clicking anywhere outside the drawer. drawerRef is a reference to the div that contains the drawer, which is used to determine in combination with buttonRef to determine
//all potential locations that the user can click to exit the drawer(basically not the button or the drawer[not the button because it already has it's own toggle function]).

export function ProfileMenu({ username, userid }: { username: string, userid: string }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuOpen && !(drawerRef.current?.contains(event.target as Node) || buttonRef.current?.contains(event.target as Node))) {
      setMenuOpen(false);
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  return (
    <div className="flex-shrink min-w-0 max-w-full z-50">
      <button ref={buttonRef} onClick={toggleMenu} className="flex items-center gap-1 hover:outline outline-2 p-1 text-sm sm:text-base rounded-sm outline-offwhite w-full">
        <Image src={profilepic} alt="pfp" width={30} height={30} className="flex-shrink-0" />
        <span className="text-offwhite truncate min-w-0 flex-grow">{username}</span>
      </button>
      {menuOpen &&
        <div ref={drawerRef} className="fixed flex flex-col top-16 right-3 w-56 outline outline-slate-700 bg-slate-900 rounded-lg text-offwhite py-1">
          {username === "" &&
            <AddUsername userid={userid} />
          }
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left hover:bg-slate-600 hover:bg-opacity-50 px-2 py-1">Log Out</button>
        </div>
      }
    </div>
  )
}