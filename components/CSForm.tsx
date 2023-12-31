'use client'

import { useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//The component initially renders with two ranks, and when the select element is changed, getInput is called and the number of ranks is updated based on what was 
//selected. When the "Add Description" button is clicked, toggleDesc is called, the button is renamed to "Remove Description", and a textarea element becomes visible. 
//Any inputs that are visible on the screen are required elements, for example if you fill out 2 ranks but there are 5 visible, you will be required to fill out all 
//5 or lower the ranks back down to 2. When the submit button is clicked, the listupload server action is called, and when it's done, the router will redirect the user
//to the posts unique url based on its post id.

export function CSForm() {

  const [selected, setSelected] = useState("");
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
    newList(formData).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  return (
    <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
      <form id="newpost" action={subHandler} className="flex justify-center pt-12 px-6 pb-16">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <header className="text-3xl justify-self-left text-slate-400">New Post</header>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-8 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
            <input name="title" placeholder="Title" className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400" required />
            <div className="row-span-1">
              <label className="text-xl text-slate-400 pr-2">1.</label>
              <input name="r1" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            <div>
              <label className="text-xl text-slate-400 pr-2">2.</label>
              <input name="r2" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            {parseInt(selected) >= 3 &&
              <div>
                <label className="text-xl text-slate-400 pr-2">3.</label>
                <input name="r3" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
            {parseInt(selected) >= 4 &&
              <div>
                <label className="text-xl text-slate-400 pr-2">4.</label>
                <input name="r4" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
            {selected === "5" &&
              <div>
                <label className="text-xl text-slate-400 pr-2">5.</label>
                <input name="r5" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
          </div>
          {desctoggle == "Remove Description" &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Description</header>
              <textarea name="description" className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleDesc} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Description</button>
            <select onChange={getInput} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
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