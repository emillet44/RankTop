'use client'

import { FC, useState } from "react"
import { useRouter } from "next/navigation"
import { editList } from "./serverActions/listedit";

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and exptoggle is to enable/disable the explanation. 
//There is also a variable for each data field which is unfortunately necessary to allow pre populated inputs that can still be edited. The setVal function handles 
//input using a switch case an updating the state variables. If the post did not contain data in certain fields like ranks 3-5 or description, their default inputs
//will be used, as this limits state variable and event handler usage. When the submit button is clicked, editList from listedit.ts is passed the original post id 
//and form data to update the post. Once done the user is redirected to the edited post. Refer to CSForm for info on other functionalities of this page.

interface Props {
  id: string;
  post: any;
}

const CSEditForm: FC<Props> = ({ id, post }) => {
  const [selected, setSelected] = useState("");
  const [exptoggle, setexp] = useState("");
  const [title, setTitle] = useState(post.title);
  const [rank1, setR1] = useState(post.rank1);
  const [rank2, setR2] = useState(post.rank2);
  const [rank3, setR3] = useState(post.rank3);
  const [rank4, setR4] = useState(post.rank4);
  const [rank5, setR5] = useState(post.rank5);
  const [explain, setExplain] = useState(post.explain);
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
    editList(formData, id).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  const setVal = (e: any) => {
    switch (e.target.name) {
      case "title":
        setTitle(e.target.value);
        break;
      case "r1":
        setR1(e.target.value);
        break;
      case "r2":
        setR2(e.target.value);
        break;
      case "r3":
        setR3(e.target.value);
        break;
      case "r4":
        setR4(e.target.value);
        break;
      case "r5":
        setR5(e.target.value);
        break;
      case "explain":
        setExplain(e.target.value);
    }
  }

  return (
    <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
      <form id="newpost" action={subHandler} className="flex justify-center pt-12 px-6 pb-16">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <header className="text-3xl justify-self-left text-slate-400">Edit Post</header>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-10 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
            <input name="title" type="text" value={title} onChange={setVal} placeholder="Title" className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400" required />
            <div>
              <label className="text-xl p-2 text-slate-400">1.</label>
              <input name="r1" value={rank1} onChange={setVal} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            <div>
              <label className="text-xl p-2 text-slate-400">2.</label>
              <input name="r2" value={rank2} onChange={setVal} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
            </div>
            {parseInt(selected) >= 3 &&
              <div>
                <label className="text-xl p-2 text-slate-400">3.</label>
                {rank3 != null &&
                  <input name="r3" value={rank3} onChange={setVal} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
                }
                {rank3 == null &&
                  <input name="r3" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />

                }
              </div>
            }
            {parseInt(selected) >= 4 &&
              <div>
                <label className="text-xl p-2 text-slate-400">4.</label>
                {rank4 != null &&
                  <input name="r4" value={rank4} onChange={setVal} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
                }
                {rank4 == null &&
                  <input name="r4" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />

                }
              </div>
            }
            {selected === "5" &&
              <div>
                <label className="text-xl p-2 text-slate-400">5.</label>
                {rank5 != null &&
                  <input name="r5" value={rank5} onChange={setVal} className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />
                }
                {rank5 == null &&
                  <input name="r5" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" required />

                }
              </div>
            }
          </div>
          {exptoggle == "Remove Explanation" &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Explanation</header>
              {explain != null &&
                <textarea name="explain" value={explain} onChange={setVal} className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
              }
              {explain == null &&
                <textarea name="explain" className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
              }
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleExp} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Explanation</button>
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
export default CSEditForm;