'use client'

import { newList } from '../listupload'
import Link from 'next/link'
import React, { useState } from "react";

export default function NewPost() {
  
  const [selected, setSelected] = useState("");
  const [exptoggle, setexp] = useState("");

  const getInput = (e: any) => {
    setSelected(e.target.value);
  };

  const toggleExp = (e: any) => {
    e.preventDefault();
    if(e.target.textContent == "Add Explanation") {
      e.target.textContent = "Remove Explanation";
      setexp(e.target.textContent);
    }
    else {
      e.target.textContent = "Add Explanation";
      setexp(e.target.textContent);
    }
  }

  return (
    <>
      <div className="flex justify-center py-7 bg-slate-500">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
        </Link>
        <Link href="/api/auth/signin">
          <button className="absolute right-2 top-1.5 hover:outline outline-2 p-2 rounded-sm">Sign In</button>
        </Link>
      </div>

      <form id="newpost" action={newList} method="POST" className="flex justify-center pt-24 px-6">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <header className="text-3xl justify-self-left">New Post</header>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-10 rounded-xl outline">
            <input name="title" placeholder="Title" className="text-4xl outline-none" required />
            <div>
              <label className="text-xl p-2">1.</label>
              <input name="r1" className="text-xl outline-none p-2 focus:border-b border-neutral-950 w-11/12" required />
            </div>
            <div>
            <label className="text-xl p-2">2.</label>
            <input name="r2" className="text-xl outline-none p-2 focus:border-b border-neutral-950 w-11/12" required />
            </div>
            {parseInt(selected) >= 3 &&
            <div>
              <label className="text-xl p-2">3.</label>
              <input name="r3" className="text-xl outline-none p-2 focus:border-b border-neutral-950 w-11/12" required />
            </div>
            }
            {parseInt(selected) >= 4 &&
            <div>
              <label className="text-xl p-2">4.</label>
              <input name="r4" className="text-xl outline-none p-2 focus:border-b border-neutral-950 w-11/12" required />
            </div>
            }
            {selected === "5" &&
            <div>
              <label className="text-xl p-2">5.</label>
              <input name="r5" className="text-xl outline-none p-2 focus:border-b border-neutral-950 w-11/12" required />
            </div>
            }
          </div>
          {exptoggle == "Remove Explanation" &&
            <div>
              <header className="text-3xl justify-self-left pb-6">Explanation</header>
              <textarea name="explain" className="w-full max-w-2xl h-44 outline rounded-md p-5 focus:outline-4" required></textarea>
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleExp} className="outline outline-2 rounded-md p-2">Add Explanation</button>
            <select onChange={getInput} className="p-2 outline outline-2 rounded-md">
              <option value="2">2 Ranks</option>
              <option value="3">3 Ranks</option>
              <option value="4">4 Ranks</option>
              <option value="5">5 Ranks</option>
            </select>
            <button type="submit" className="outline outline-2 rounded-md p-2">Submit</button>
          </div>
        </div>
      </form>
    </>
  )
}