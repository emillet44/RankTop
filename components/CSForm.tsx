'use client'

import { useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//The component initially renders with two ranks, and when the select element is changed, getInput is called and the number of ranks is updated based on what was 
//selected. When the "Add Description" button is clicked, toggleDesc is called, the button is renamed to "Remove Description", and a textarea element becomes visible. 
//Any inputs that are visible on the screen are required elements, for example if you fill out 2 ranks but there are 5 visible, you will be required to fill out all 
//5 or lower the ranks back down to 2. When the submit button is clicked, the listupload server action is called, and when it's done, the router will redirect the user
//to the posts unique url based on its post id.

//New functionality: The form now has a new toggle button for adding images to the post. The number of image inputs corresponds to the number of ranks, and images are
// draggable using the HTML drag and drop API in combination with React state to update the display as well as the url so images correspond to their proper rank. The drop 
//container div toggles between storing the file input or preview image based on whether a file was uploaded or not, however only the image is draggable and can be 
//dropped/swapped to another div. Images can also be cleared with a hover X button. A significant amount of switch cases and near duplicate code was used in this new update,
//making this function the first on the chopping block for refactoring(if ever).

export function CSForm() {

  const [selected, setSelected] = useState("");
  const [desctoggle, setDesc] = useState("");
  const [image, setImage] = useState(false);
  const [file1, setFile1] = useState("");
  const [file2, setFile2] = useState("");
  const [file3, setFile3] = useState("");
  const [file4, setFile4] = useState("");
  const [file5, setFile5] = useState("");
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
    formData.append("img1", file1);
    formData.append("img2", file2);
    formData.append("img3", file3);
    formData.append("img4", file4);
    formData.append("img5", file5);
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
      setFile1("");
      setFile2("");
      setFile3("");
      setFile4("");
      setFile5("");
    }
    setImage(!image);
  }

  const previewImage = (e: any) => {
    if (e.target.files[0] != undefined) {
      switch (parseInt(e.target.id)) {
        case 1:
          setFile1(URL.createObjectURL(e.target.files[0]));
          break;
        case 2:
          setFile2(URL.createObjectURL(e.target.files[0]));
          break;
        case 3:
          setFile3(URL.createObjectURL(e.target.files[0]));
          break;
        case 4:
          setFile4(URL.createObjectURL(e.target.files[0]));
          break;
        case 5:
          setFile5(URL.createObjectURL(e.target.files[0]));
      }
    }
  }

  const removeImg = (e: any) => {
    e.preventDefault();
    const bname = e.target.parentElement.parentElement.id;
    switch (parseInt(bname)) {
      case 1:
        setFile1("");
        break;
      case 2:
        setFile2("");
        break;
      case 3:
        setFile3("");
        break;
      case 4:
        setFile4("");
        break;
      case 5:
        setFile5("");
    }
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
      switch (parseInt(imgid)) {
        case 1:
          setFile1(e.target.src);
          break;
        case 2:
          setFile2(e.target.src);
          break;
        case 3:
          setFile3(e.target.src);
          break;
        case 4:
          setFile4(e.target.src);
          break;
        case 5:
          setFile5(e.target.src);
      }
      switch (parseInt(e.target.id)) {
        case 1:
          setFile1(url);
          break;
        case 2:
          setFile2(url);
          break;
        case 3:
          setFile3(url);
          break;
        case 4:
          setFile4(url);
          break;
        case 5:
          setFile5(url);
      }
    }
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
          {image &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Images</header>
              <div className="w-full max-w-2xl max-h-96 outline outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5 grid grid-cols-5 gap-3 grid-flow-row auto-rows-min">
                <label>1.</label>
                <div onDrop={dropHandler} onDragOver={dragoverHandler} className="outline flex row-start-2">
                  {!file1 &&
                    <input id="1" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                  }
                  {file1 != "" &&
                    <div className="group relative">
                      <Image id="1" draggable onDragStart={dragstartHandler} src={file1} alt="Image 1" width={200} height={200} className=""></Image>
                      <button id="1" className="invisible group-hover:visible absolute top-0 right-0" onClick={removeImg}>
                        <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                      </button>
                    </div>
                  }
                </div>
                <label>2.</label>
                <div onDrop={dropHandler} onDragOver={dragoverHandler} className="outline flex row-start-2">
                  {!file2 &&
                    <input id="2" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                  }
                  {file2 != "" &&
                    <div className="group relative">
                      <Image id="2" draggable onDragStart={dragstartHandler} src={file2} alt="Image 2" width={200} height={200} className=""></Image>
                      <button id="2" className="invisible group-hover:visible absolute top-0 right-0" onClick={removeImg}>
                        <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                      </button>
                    </div>
                  }
                </div>
                {parseInt(selected) >= 3 &&
                  <>
                    <label>3.</label>
                    <div onDrop={dropHandler} onDragOver={dragoverHandler} className="outline flex row-start-2">
                      {!file3 &&
                        <input id="3" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                      }
                      {file3 != "" &&
                        <div className="group relative">
                          <Image id="3" draggable onDragStart={dragstartHandler} src={file3} alt="Image 3" width={200} height={200} className=""></Image>
                          <button id="3" className="invisible group-hover:visible absolute top-0 right-0" onClick={removeImg}>
                            <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                          </button>
                        </div>
                      }
                    </div>
                  </>
                }
                {parseInt(selected) >= 4 &&
                  <>
                    <label>4.</label>
                    <div onDrop={dropHandler} onDragOver={dragoverHandler} className="outline flex row-start-2">
                      {!file4 &&
                        <input id="4" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                      }
                      {file4 != "" &&
                        <div className="group relative">
                          <Image id="4" draggable onDragStart={dragstartHandler} src={file4} alt="Image 4" width={200} height={200} className=""></Image>
                          <button id="4" className="invisible group-hover:visible absolute top-0 right-0" onClick={removeImg}>
                            <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                          </button>
                        </div>
                      }
                    </div>
                  </>
                }
                {selected === "5" &&
                  <>
                    <label>5.</label>
                    <div onDrop={dropHandler} onDragOver={dragoverHandler} className="outline flex row-start-2">
                      {!file5 &&
                        <input id="5" type="file" accept="image/*" className="opacity-0" onChange={previewImage} />
                      }
                      {file5 != "" &&
                        <div className="group relative">
                          <Image id="5" draggable onDragStart={dragstartHandler} src={file5} alt="Image 5" width={200} height={200} className="group"></Image>
                          <button id="5" className="invisible group-hover:visible absolute top-0 right-0" onClick={removeImg}>
                            <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                          </button>
                        </div>
                      }
                    </div>
                  </>
                }
              </div>
            </div>
          }
          {desctoggle &&
            <div>
              <header className="text-3xl justify-self-left pb-6 text-slate-400">Description</header>
              <textarea name="explain" className="w-full max-w-2xl max-h-96 h-44 outline focus:outline-4 outline-slate-700 rounded-xl p-5 text-slate-400 bg-slate-50 bg-opacity-5" required />
            </div>
          }
          <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
            <button onClick={toggleImages} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Images</button>
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