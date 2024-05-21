'use client'

import { useState } from "react";

//This function will be used to add comments to a post, however currently they are not stored anywhere and are only displayed client side for the user to see, until they refresh the
//page.

export default function AddComment() {

  const [comment, setComment] = useState("");
  const [submittedcoms, setSubmittedComs] = useState<string[]>([]);

  const setVal = (e: any) => {
    setComment(e.target.textContent);
  }

  const subHandler = (e: any) => {
    if(comment.trim() !== "") {
      setSubmittedComs([...submittedcoms, comment]);
      setComment("");
      document.getElementById("comment")!.textContent = "";
    }
  }
  return (
    <div>
      <header className="text-3xl text-slate-400 justify-self-left pb-4">Comments</header>
      <div className="pb-4 grid">
        <span contentEditable onInput={setVal} id="comment" className="peer text-xl text-slate-400 outline-none border-b border-slate-400 min-w-full inline-block row-start-1 col-start-1 z-40" />
        <label className="peer-[&:not(:empty)]:invisible text-slate-400 peer-focus:invisible row-start-1 col-start-1 z-0">Add a comment...</label>
      </div>
      {comment != "" &&
        <div className="flex justify-end">
          <button onClick={subHandler} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Submit</button>
        </div>
      }
      {submittedcoms.map((com, index) => (
        <p key={index} className="pt-2 text-xl text-slate-400">{com}</p>
      ))}
    </div>
  )
}