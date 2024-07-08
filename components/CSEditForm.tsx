'use client'

import { FC, useState } from "react"
import { useRouter } from "next/navigation"
import { editList } from "./serverActions/listedit";

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//Textareas are used instead of inputs to allow the old values to be populated, while still allowing edit functionality. Startranks provides the number of ranks to display
//when first loading the post When the submit button is clicked, editList from listedit.ts is passed the original post id and form data to update the post. Once done the
//user is redirected to the edited post. Refer to CSForm for info on other functionalities of this page.

export function CSEditForm({ id, post, startranks }: { id: string, post: any, startranks: number }) {
  const statcats = ["", "Gaming", "Music", "Movies", "TV Shows", "Tech", "Sports", "Memes", "Fashion", "Food & Drink", "Celebrities", "Lifestyle", "Books", "Science & Nature", "Education"];
  const [selected, setSelected] = useState(startranks.toString());
  const [desctoggle, setDesc] = useState("");
  const [category, setCategory] = useState(statcats.includes(post.category) ? post.category : "Custom");
  const [lockcat, setLockCat] = useState(statcats.includes(category) ? "" : post.category);
  const router = useRouter();

  const getInput = (e: any) => {
    setSelected(e.target.value);
  };

  const getCategory = (e: any) => {
    setCategory(e.target.value);
    if (lockcat != "") {
      setLockCat("");
    }
  }

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

  const lockCategory = (e: any) => {
    e.preventDefault();
    setLockCat(e.target.closest('div').querySelector('input').value);
  }

  const subHandler = (formData: FormData) => {
    if(lockcat != "") {
      formData.append("category", lockcat);
    }
    else if(category != "None" && category != "Custom") {
      formData.append("category", category);
    }
    else {
      formData.append("category", "");
    }
    editList(formData, id).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
      <form id="editpost" action={subHandler} className="flex justify-center pt-[130px] md:pt-[82px] px-6 pb-10">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
          <div className="flex justify-between">
            <header className="text-3xl justify-self-left text-slate-400 self-end">Edit Post</header>
            <div className="flex sm:flex-row flex-col space-y-3">
              <label className="text-xl text-slate-400 pr-1 flex pt-4">Category:</label>
              <select onChange={getCategory} value={category} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
                <option className="text-black">None</option>
                <option className="text-black">Gaming</option>
                <option className="text-black">Music</option>
                <option className="text-black">Movies</option>
                <option className="text-black">TV Shows</option>
                <option className="text-black">Tech</option>
                <option className="text-black">Sports</option>
                <option className="text-black">Memes</option>
                <option className="text-black">Fashion</option>
                <option className="text-black">Food & Drink</option>
                <option className="text-black">Celebrities</option>
                <option className="text-black">Lifestyle</option>
                <option className="text-black">Books</option>
                <option className="text-black">Science & Nature</option>
                <option className="text-black">Education</option>
                <option className="text-black">Custom</option>
              </select>
              {category == "Custom" &&
                <>
                  {!lockcat &&
                    <div className=" pl-2 flex items-center space-x-2">
                      <input maxLength={16} className="text-xl text-slate-400 outline-none border-b border-slate-400 bg-transparent placeholder:text-slate-400 w-32 md:w-48"></input>
                      <button onClick={lockCategory} className="outline outline-2 outline-slate-700 rounded-md p-1 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add</button>
                    </div>
                  }
                  {lockcat &&
                    <label className="pl-2 flex items-center text-xl text-slate-400">{lockcat}</label>
                  }
                </>
              }
            </div>
          </div>
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 p-4 sm:p-6 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
            <textarea data-gramm="false" defaultValue={post.title} form="editpost" name="title" rows={1} className="text-2xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400 resize-none overflow-hidden align-bottom" required />
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
          <div className="max-w-2xl w-full h-10 flex flex-wrap justify-end space-x-5 gap-y-5">
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