'use client'

import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";
import { AddUsername } from "./AddUsername"
import { signOut } from "next-auth/react";
import Link from "next/link";

//This is the menu button for mobile view that, when clicked, will open a right side menu listing three buttons: Add Username, New Post, and Log Out.

export function CompressedMenu({username} : {username:string}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    setMenuOpen(!menuOpen);
  }

  return (
    <div className="z-30 sm:hidden">
      <button onClick={openMenu} className="absolute right-2 top-1.5 outline-none py-2 px-2 rounded-sm text-offwhite transition-all">
        <FontAwesomeIcon icon={faBars} className="w-8 h-8" style={{ color: "#FFFFF0" }} />
      </button>
      {menuOpen &&
        <div onClick={openMenu} className="fixed top-0 right-0 w-screen h-screen bg-black opacity-80" />
      }
      <div className={`fixed top-0 right-0 h-screen w-72 transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button className="absolute left-0 top-1">
          <FontAwesomeIcon onClick={openMenu} icon={faXmark} className="w-8 h-8" style={{ color: "#FFFFF0" }} />
        </button>
        <div className="fixed flex flex-col top-0 right-0 h-screen w-64 bg-zinc-950 text-offwhite text-2xl px-3 pt-2 gap-2">
          <Link href="/newpost" className="hover:bg-slate-600 hover:bg-opacity-50 px-2 py-1">
            <button>New Post</button>
          </Link>
          {username == "" &&
            <AddUsername type="menu" />
          }
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left hover:bg-slate-600 hover:bg-opacity-50 px-2 py-1">Log Out</button>
        </div>
      </div>
    </div>
  )
}