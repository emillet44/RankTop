'use client'

import { useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"

//This function starts by intializing an unfortunate amount of state variables and the Nextjs router. The component initially renders with two ranks, and when the
//select element is changed, getInput is called and the number of ranks is updated based on what was selected. When the "Add Explanation" button is clicked, toggleExp
//is called, the button is renamed to "Remove Explanation", and a textarea element becomes visible. The reason for all the state variables is that each input needs to 
//be individually validated for text content using regex. If only one state variable was used, all inputs would display the same text and they would not be individually
//editable. Any inputs that are visible on the screen are required elements, for example if you fill out 2 ranks but there are 5 visible, you will be required to fill out
//all 5 or lower the ranks back down to 2. When the submit button is clicked, the listupload server action is called, and when it's done, the router will route the user to 
//the posts unique url based on its post id.

//*** REMOVE ALL THESE STATE VARIABLES AND JUST CHECK ONCE AT THE END FOR FAULTY CHARACTERS, THIS WILL ALSO HELP WITH CLEARING TEXT AFTER A RANK IS HIDDEN.
export function CSForm() {

  const [selected, setSelected] = useState("");
  const [exptoggle, setexp] = useState("");
  const [title, setTitle] = useState('');
  const [r1, setR1] = useState('');
  const [r2, setR2] = useState('');
  const [r3, setR3] = useState('');
  const [r4, setR4] = useState('');
  const [r5, setR5] = useState('');
  const [explain, setExplain] = useState('');
  const router = useRouter();

  const getInput = (e: any) => {
    setSelected(e.target.value);

  };

  const toggleExp = (e: any) => {
    e.preventDefault();
    if (e.target.textContent == "Add Explanation") {
      e.target.textContent = "Remove Explanation";
      setexp(e.target.textContent);
    }
    else {
      e.target.textContent = "Add Explanation";
      setexp(e.target.textContent);
    }
  };

  const subHandler = (formData: FormData) => {
    newList(formData).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  const checkChars = (e: any) => {
    const result = e.target.value.replace(/[^a-z0-9$-/:-?{-~!"^_`\[\] ]/gi, '');
    if (e.target.name == "title") {
      setTitle(result);
    }
    else if (e.target.name == "r1") {
      setR1(result);
    }
    else if (e.target.name == "r2") {
      setR2(result);
    }
    else if (e.target.name == "r3") {
      setR3(result);
    }
    else if (e.target.name == "r4") {
      setR4(result);
    }
    else if (e.target.name == "r5") {
      setR5(result);
    }
    else {
      setExplain(result);
    }
  }

  return (
    <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950">
      <form id="newpost" action={subHandler} method="POST" className="flex justify-center pt-12 px-6 pb-16">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <header className="text-3xl justify-self-left text-slate-400">New Post</header>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-10 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
            <input name="title" value={title} onChange={checkChars} placeholder="Title" className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400" required />
            <div>
              <label className="text-xl p-2 text-slate-400">1.</label>
              <input name="r1" value={r1} onChange={checkChars} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            <div>
              <label className="text-xl p-2 text-slate-400">2.</label>
              <input name="r2" value={r2} onChange={checkChars} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            {parseInt(selected) >= 3 &&
              <div>
                <label className="text-xl p-2 text-slate-400">3.</label>
                <input name="r3" value={r3} onChange={checkChars} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
            {parseInt(selected) >= 4 &&
              <div>
                <label className="text-xl p-2 text-slate-400">4.</label>
                <input name="r4" value={r4} onChange={checkChars} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
            {selected === "5" &&
              <div>
                <label className="text-xl p-2 text-slate-400">5.</label>
                <input name="r5" value={r5} onChange={checkChars} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
              </div>
            }
          </div>
          {exptoggle == "Remove Explanation" &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Explanation</header>
              <textarea name="explain" value={explain} onChange={checkChars} className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleExp} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 bg-opacity-5 text-slate-400">Add Explanation</button>
            <select onChange={getInput} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 text-slate-400">
              <option value="2" className="text-black">2 Ranks</option>
              <option value="3" className="text-black">3 Ranks</option>
              <option value="4" className="text-black">4 Ranks</option>
              <option value="5" className="text-black">5 Ranks</option>
            </select>
            <button type="submit" className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 bg-opacity-5 text-slate-400">Submit</button>
          </div>
        </div>
      </form>
    </div>

  )
}