'use client'

import { FC, useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { signIn } from "next-auth/react"

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//The component initially renders with two ranks, and when the select element is changed, getInput is called and the number of ranks is updated based on what was 
//selected. When the "Add Description" button is clicked, toggleDesc is called, the button is renamed to "Remove Description", and a textarea element becomes visible. 
//Any inputs that are visible on the screen are required elements, for example if you fill out 2 ranks but there are 5 visible, you will be required to fill out all 
//5 or lower the ranks back down to 2. When the submit button is clicked, the listupload server action is called, and when it's done, the router will redirect the user
//to the posts unique url based on its post id.
//The form buttons now scale to accomodate for mobile viewing.

//New functionality: The form now has a new toggle button for adding images to the post. The number of image inputs corresponds to the number of ranks, and images are
// draggable using the HTML drag and drop API in combination with React state to update the display as well as the url so images correspond to their proper rank. The drop 
//container div toggles between storing the file input or preview image based on whether a file was uploaded or not, however only the image is draggable and can be 
//dropped/swapped to another div. Images can also be cleared with a hover X button. Images are only allowed to be uploaded by signed in users, to prevent abuse, which was
//done by making the component a functional component and passing the signed in state prop from the newpost page. A significant amount of switch cases and near duplicate code 
//was used in this new update, making this function the first on the chopping block for refactoring(if ever).

//Update: I know no one asked but I actually came across the refactoring solution for this function before I even actually finished building it! It has to be the largest code
//simplification in this project, in which the file state variables were replaced with two arrays(there's two for another reason, because the files need to be both uploaded and
//previewed, the preview url and file have to be stored), and the HTML element ids are used as indices to correctly update each index in the array. An array of null values was also
//added so that the other two arrays can be cleared easily. superUpdateImage may seem very similar to updateImage however it was necessary to prevent a data race in the updating of
//two React state array indices. Both indices are updated in one function now, which is important to ensure the drag and drop functionality works properly.
//Added a loading screen using the submitted state to confirm a post has been submitted/to prevent resubmission

export function CSForm({signedin} : {signedin: boolean}) {

  const [selected, setSelected] = useState("");
  const [desctoggle, setDesc] = useState("");
  const [image, setImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const[files, setFiles] = useState<Array<File | null>>(Array(5).fill(null));
  const[urls, setUrls] = useState<Array<string | null>>(Array(5).fill(null));
  const clearedlist = [null, null, null, null, null];

  const [modalon, setModal] = useState(false);
  const router = useRouter();

  const superUpdateImage = (index1: number, newfile1: File | null, newurl1: string | null, index2: number, newfile2: File | null, newurl2: string | null) => {
    const updatedFiles = files.map((c, i) => {
      if (i === index1) {
        return newfile1;
      }
      else if (i === index2) {
        return newfile2;
      }
      else {
        return c;
      }
    })
    setFiles(updatedFiles);


    const updatedUrls = urls.map((c, i) => {
      if (i === index1) {
        return newurl1;
      }
      else if (i === index2) {
        return newurl2;
      }
      else {
        return c;
      }
    })
    setUrls(updatedUrls);
  }

  const updateImage = (index: number, newfile: File | null, newurl: string | null) => {

    const updatedFiles = files.map((c, i) => {
      if (i === index) {
        return newfile;
      }
      else {
        return c;
      }
    })
    setFiles(updatedFiles);


    const updatedUrls = urls.map((c, i) => {
      if (i === index) {
        return newurl;
      }
      else {
        return c;
      }
    })
    setUrls(updatedUrls);
  }

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

  const subHandler = (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    const formData = new FormData(e.target);
    if (files[0] !== null) {
      formData.append("img1", new Blob([files[0]], { type: files[0].type }));
    }
    if (files[1] !== null) {
      formData.append("img2", new Blob([files[1]], { type: files[1].type }));
    }
    if (files[2] !== null) {
      formData.append("img3", new Blob([files[2]], { type: files[2].type }));
    }
    if (files[3] !== null) {
      formData.append("img4", new Blob([files[3]], { type: files[3].type }));
    }
    if (files[4] !== null) {
      formData.append("img5", new Blob([files[4]], { type: files[4].type }));
    }
    newList(formData).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  const toggleImages = (e: any) => {
    e.preventDefault();
    if (image) {
      e.target.textContent = "Add Images";
    }
    else {
      e.target.textContent = "Remove Images";

      setFiles(clearedlist);
      setUrls(clearedlist);
    }
    setImage(!image);
  }

  const previewImage = (e: any) => {
    if (e.target.files[0] != undefined) {
      updateImage(parseInt(e.target.id), e.target.files[0], URL.createObjectURL(e.target.files[0]));
    }
  }

  const removeImg = (e: any, imgnum: number) => {
    e.preventDefault();
    updateImage(imgnum-1, null, null);
  }

  function dragstartHandler(e: any) {
    e.dataTransfer.setData("text/uri-list", e.target.src);
    e.dataTransfer.setData("text/plain", e.target.id);
  }

  function dragoverHandler(e: any) {
    e.preventDefault();
  }

  function dropHandler(e: any) {
    e.preventDefault();
    const url = e.dataTransfer.getData("text/uri-list");
    const imgid = e.dataTransfer.getData("text/plain");
    if (e.target.src != url) { 
      const test = files[e.target.id];
      
      superUpdateImage(parseInt(e.target.id), files[parseInt(imgid)], url, parseInt(imgid), test, e.target.src);

    }
  }

  const toggleModal = (e: any) => {
    e.preventDefault();
    setModal(!modalon);
  }

  if(!submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <form id="newpost" onSubmit={subHandler} className="flex justify-center pt-12 px-6 pb-16">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
            <header className="text-3xl justify-self-left text-slate-400">New Post</header>
            <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-8 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
              <input name="title" placeholder="Title" className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400" required />
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">1.</label>
                <input name="r1" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent flex-1" required />
              </div>
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">2.</label>
                <input name="r2" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent flex-1" required />
              </div>
              {parseInt(selected) >= 3 &&
                <div className="flex items-center">
                  <label className="text-xl text-slate-400 pr-2">3.</label>
                  <input name="r3" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent flex-1" required />
                </div>
              }
              {parseInt(selected) >= 4 &&
                <div className="flex items-center">
                  <label className="text-xl text-slate-400 pr-2">4.</label>
                  <input name="r4" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent flex-1" required />
                </div>
              }
              {selected === "5" &&
                <div className="flex items-center">
                  <label className="text-xl text-slate-400 pr-2">5.</label>
                  <input name="r5" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent flex-1" required />
                </div>
              }
            </div>
            {image &&
              <div>
                <header className="text-3xl justify-self-left pb-6 text-slate-400">Images</header>
                <div className="w-full max-w-2xl outline outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5 flex flex-wrap gap-3">
                  {urls[0] == null &&
                    <div>
                      <label>1.</label>
                      <div className="outline w-28">
                        <input id="0" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                      </div>
                    </div>
  
                  }
                  {urls[0] != null &&
                    <div>
                      <label>1.</label>
                      <div onDrop={dropHandler} onDragOver={dragoverHandler} className="group relative outline">
                        <Image id="0" draggable onDragStart={dragstartHandler} src={urls[0]} alt="Image 1" width={200} height={200}></Image>
                        <button id="0" className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, 1)}>
                          <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  }
                  {urls[1] == null &&
                    <div>
                      <label>2.</label>
                      <div className="outline w-28">
                        <input id="1" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                      </div>
                    </div>
  
                  }
                  {urls[1] != null &&
                    <div>
                      <label>2.</label>
                      <div onDrop={dropHandler} onDragOver={dragoverHandler} className="group relative outline">
                        <Image id="1" draggable onDragStart={dragstartHandler} src={urls[1]} alt="Image 2" width={200} height={200}></Image>
                        <button id="1" className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, 2)}>
                          <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  }
                  {parseInt(selected) >= 3 &&
                    <>
                      {urls[2] == null &&
                        <div>
                          <label>3.</label>
                          <div className="outline w-28">
                            <input id="2" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                          </div>
                        </div>
  
                      }
                      {urls[2] != null &&
                        <div>
                          <label>3.</label>
                          <div onDrop={dropHandler} onDragOver={dragoverHandler} className="group relative outline">
                            <Image id="2" draggable onDragStart={dragstartHandler} src={urls[2]} alt="Image 3" width={200} height={200}></Image>
                            <button id="2" className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, 3)}>
                              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      }
                    </>
                  }
                  {parseInt(selected) >= 4 &&
                    <>
                      {urls[3] == null &&
                        <div>
                          <label>4.</label>
                          <div className="outline w-28">
                            <input id="3" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                          </div>
                        </div>
  
                      }
                      {urls[3] != null &&
                        <div>
                          <label>4.</label>
                          <div onDrop={dropHandler} onDragOver={dragoverHandler} className="group relative outline">
                            <Image id="3" draggable onDragStart={dragstartHandler} src={urls[3]} alt="Image 4" width={200} height={200}></Image>
                            <button id="3" className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, 4)}>
                              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      }
                    </>
                  }
                  {selected === "5" &&
                    <>
                      {urls[4] == null &&
                        <div>
                          <label>5.</label>
                          <div className="outline w-28">
                            <input id="4" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                          </div>
                        </div>
  
                      }
                      {urls[4] != null &&
                        <div>
                          <label>5.</label>
                          <div onDrop={dropHandler} onDragOver={dragoverHandler} className="group relative outline">
                            <Image id="4" draggable onDragStart={dragstartHandler} src={urls[4]} alt="Image 5" width={200} height={200}></Image>
                            <button id="4" className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, 5)}>
                              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      }
                    </>
                  }
                </div>
              </div>
            }
            {desctoggle == "Remove Description" &&
              <div>
                <header className="text-3xl justify-self-left pb-6 text-slate-400">Description</header>
                <textarea name="description" className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
              </div>
            }
            <div className="max-w-2xl w-full h-10 flex flex-wrap justify-end space-x-5 gap-y-5">
              {!signedin &&
                <button type="button" onClick={toggleModal} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Images</button>
              }
              {signedin &&
                <button onClick={toggleImages} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Images</button>
              }
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
        {modalon &&
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600/50">
            <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
              <button onClick={toggleModal} className="flex justify-self-end justify-center">
                <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
              </button>
              <h1 className="text-3xl justify-self-center pb-2 z-50">Sign in to add images to your post</h1>
              <button onClick={() => signIn(undefined, { callbackUrl: `/newpost` })} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Sign In</button>
            </div>
          </div>
        }
      </div>
    )
  }
  else {
    return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
      <header className="text-slate-400 text-3xl">Redirecting to your post now!</header>   
    </div>
    )
  }  
}
