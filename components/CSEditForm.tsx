'use client'

import { FC, useState } from "react"
import { useRouter } from "next/navigation"
import { editList } from "./serverActions/listedit";

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//Textareas are used instead of inputs to allow the old values to be populated, while still allowing edit functionality. Startranks provides the number of ranks to display
//when first loading the post When the submit button is clicked, editList from listedit.ts is passed the original post id and form data to update the post. Once done the
//user is redirected to the edited post. Refer to CSForm for info on other functionalities of this page.

export function CSEditForm({ id, post, startranks } : {id:string, post:any, startranks:number}) {
  const [selected, setSelected] = useState(startranks.toString());
  const [desctoggle, setDesc] = useState("");
  const router = useRouter();

  const getInput = (e: any) => {
    setSelected(e.target.value);
  };

  const toggleDesc = (e: any) => {
    e.preventDefault();
    if (e.target.textContent == "Add Description") {
      e.target.textContent = "Remove Description";
      setDesc(e.target.textContent);
    }
    else {
      e.target.textContent = "Add Description";
      setDesc(e.target.textContent);
    }
  };

  const subHandler = (formData: FormData) => {
    editList(formData, id).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  return (
    <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
      <form id="editpost" action={subHandler} className="flex justify-center pt-12 px-6 pb-16">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <header className="text-3xl justify-self-left text-slate-400">Edit Post</header>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-10 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
          <textarea data-gramm="false" defaultValue={post.title} form="editpost" name="title" rows={1} className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400 resize-none overflow-hidden align-bottom" required />
            <div className="flex items-center">
              <label className="text-xl text-slate-400 pr-2">1.</label>
              <textarea data-gramm="false" defaultValue={post.rank1} form="editpost" name="r1" rows={1} className="text-xl text-slate-400 outline-none p-2 pl-1 focus:border-b border-slate-400 w-11/12 bg-transparent resize-none overflow-hidden align-bottom" required />
            </div>
            <div className="flex items-center">
              <label className="text-xl text-slate-400 pr-2">2.</label>
              <textarea data-gramm="false" defaultValue={post.rank2} form="editpost" name="r2" rows={1} className="text-xl text-slate-400 outline-none p-2 pl-1 focus:border-b border-slate-400 w-11/12 bg-transparent resize-none overflow-hidden align-bottom" required />
            </div>
            {parseInt(selected) >= 3 &&
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">3.</label>
                <textarea data-gramm="false" defaultValue={post.rank3} form="editpost" name="r3" rows={1} className="text-xl text-slate-400 outline-none p-2 pl-1 focus:border-b border-slate-400 w-11/12 bg-transparent resize-none overflow-hidden align-bottom" required />
              </div>
            }
            {parseInt(selected) >= 4 &&
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">4.</label>
                <textarea data-gramm="false" defaultValue={post.rank4} form="editpost" name="r4" rows={1} className="text-xl text-slate-400 outline-none p-2 pl-1 focus:border-b border-slate-400 w-11/12 bg-transparent resize-none overflow-hidden align-bottom" required />
              </div>
            }
            {selected === "5" &&
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">5.</label>
                <textarea data-gramm="false" defaultValue={post.rank5} form="editpost" name="r5" rows={1} className="text-xl text-slate-400 outline-none p-2 pl-1 focus:border-b border-slate-400 w-11/12 bg-transparent resize-none overflow-hidden align-bottom" required />
              </div>
            }
          </div>
          {desctoggle == "Remove Description" &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Description</header>
              <textarea form="editpost" name="description" defaultValue={post.description} className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleDesc} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Description</button>
            <select defaultValue={startranks} onChange={getInput} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
              <option value="2" className="text-black">2 Ranks</option>
              <option value="3" className="text-black">3 Ranks</option>
              <option value="4" className="text-black">4 Ranks</option>
              <option value="5" className="text-black">5 Ranks</option>
            </select>
            <button type="submit" className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Submit</button>
          </div>
        </div>
      </form>
    </div>
  )
}