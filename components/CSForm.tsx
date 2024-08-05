'use client'

import { useCallback, useRef, useState } from "react"
import { newList } from "./serverActions/listupload"
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { faAngleDown, faAngleUp, faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { signIn } from "next-auth/react"

//This function starts by intializing state variables and the NextJS router. Selected is for the number of ranks, and desctoggle is to enable/disable the description. 
//The component initially renders with two ranks, and when the select element is changed, changeInput is called and the number of ranks is updated based on what was 
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
//Added a loading screen using the submitted state to confirm a post has been submitted/to prevent resubmission. Added a category select to the top right with a custom option, saved
//in a state variable and tacked onto the formdata.

interface ImageData {
  file: File | null;
  url: string | null;
}
type Group = {
  id: string,
  name: string
}


export function CSForm({ signedin, username, userid, usergroups }: { signedin: boolean, username: string, userid: string, usergroups: any }) {

  const [ranks, setRanks] = useState(2);
  const [category, setCategory] = useState("None");
  const [desctoggle, setDesc] = useState(false);
  const descref = useRef<HTMLTextAreaElement | null>(null);
  const descvalue = useRef("");
  const [image, setImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visibility, setVisibility] = useState("Public");

  const [modalon, setModal] = useState(false);
  const router = useRouter();

  const [imageData, setImageData] = useState<ImageData[]>(Array(5).fill({ file: null, url: null }));
  const draggedIndex = useRef<number | null>(null);

  const updateImageData = (index: number, newData: Partial<ImageData>) => {
    setImageData(prevData => {
      const newArray = [...prevData];
      if (index >= 0 && index < newArray.length) {
        newArray[index] = { ...newArray[index], ...newData };
      }
      return newArray;
    });
  }

  const swapImages = (index1: number, index2: number) => {
    setImageData(prevData => {
      const newData = [...prevData];
      if (index1 >= 0 && index1 < newData.length && index2 >= 0 && index2 < newData.length) {
        [newData[index1], newData[index2]] = [newData[index2], newData[index1]];
      }
      return newData;
    });
  }

  const handleDragStart = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    draggedIndex.current = index;
  }

  const handleDragOver = (e: any) => {
    e.preventDefault();
  }

  const handleDrop = (e: any, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex.current !== null && draggedIndex.current !== dropIndex) {
      swapImages(draggedIndex.current, dropIndex);
    }
    draggedIndex.current = null;
  }

  const handleFileChange = (e: any, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateImageData(index, { file, url });
    }
  }

  const removeImg = (e: any, index: number) => {
    e.preventDefault();
    updateImageData(index, { file: null, url: null });
  }

  const changeCategory = (e: any) => {
    setCategory(e.target.value);
  }

  const toggleDesc = (e: any) => {
    e.preventDefault();
    if (desctoggle && descref.current) {
      descvalue.current = descref.current.value;
    }
    setDesc(!desctoggle);
  };

  const subHandler = (e: any) => {
    e.preventDefault();
    setSubmitted(true);

    const formData = new FormData(e.currentTarget);

    imageData.forEach((data, index) => {
      if (data.file !== null) {
        formData.append(`img${index + 1}`, new Blob([data.file], { type: data.file.type }));
      }
    });

    formData.append("category", category);

    if (descref.current !== null) {
      formData.append("description", descref.current.value);
    }
    else {
      formData.append("description", descvalue.current);
    }

    formData.append("username", username);
    formData.append("userid", userid);
    formData.append("visibility", visibility);

    newList(formData).then((result) => {
      router.push(`/post/${result}`);
    });
  }

  const toggleImages = (e: any) => {
    e.preventDefault();
    setImage(!image);
  }

  const toggleModal = (e: any) => {
    e.preventDefault();
    setModal(!modalon);
  }

  const changeRank = (e: any) => {
    e.preventDefault();
    if (e.target.textContent == "-") {
      setRanks(ranks - 1);
    }
    else {
      setRanks(ranks + 1);
    }
  }

  const changeVisibility = (e: any) => {
    setVisibility(e.target.value);
    console.log(e.target.value);
  }

  if (!submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed text-offwhite">
        <form id="newpost" onSubmit={subHandler} className="flex justify-center pt-[130px] md:pt-[82px] px-6 pb-10">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 p-4 sm:p-6 rounded-xl shadow-black shadow-lg bg-slate-500 bg-opacity-20 w-full max-w-2xl">
            <div className="flex justify-between -mb-2">
              <header className="text-3xl font-bold">New Post</header>
              <div className="flex flex-row">
                <label htmlFor="rank" className="text-xl pr-2">Ranks:</label>
                <div className="flex flex-row outline outline-2 outline-slate-700 rounded-md w-18 h-8 items-center">
                  <button onClick={changeRank} disabled={ranks === 2} className="text-2xl w-6 bg-slate-50 bg-opacity-5 hover:bg-opacity-10">-</button>
                  <span className="text-xl w-6 py-1 flex justify-center bg-slate-50 bg-opacity-5">{ranks}</span>
                  <button onClick={changeRank} disabled={ranks === 5} className="text-2xl w-6 bg-slate-50 bg-opacity-5 hover:bg-opacity-10">+</button>
                </div>
              </div>
            </div>
            <div className="outline-none rounded-md p-4 my-4 bg-slate-700 bg-opacity-30">
              <input name="title" placeholder="Title" className="text-2xl font-semibold outline-none w-full bg-transparent placeholder-slate-400" required pattern="\S+" maxLength={40} />
              {[...Array(ranks)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <label className="text-xl">{index + 1}.</label>
                  <input name={`r${index + 1}`} className="flex-1 text-xl bg-transparent border-b border-transparent outline-none focus:border-blue-500 pb-1 w-11/12" required pattern="\S+" />
                </div>
              ))}
            </div>
            {!signedin &&
              <button type="button" onClick={toggleModal} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 ">Add Images</button>
            }
            {signedin &&
              <button onClick={toggleImages} className="flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 w-full text-xl ">
                Images
                <FontAwesomeIcon icon={image ? faAngleUp : faAngleDown} style={{ color: "#ffffff" }} className="h-7 flex pr-2" />
              </button>
            }
            {image && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-700 bg-opacity-30 rounded-md p-4">
                {[...Array(ranks)].map((_, index) => {
                  const { url } = imageData[index];
                  return (
                    <div key={index} className="space-y-2" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}>
                      <label className="text-xl">{index + 1}.</label>
                      {url === null &&
                        <div className="relative border-2 border-dashed border-slate-500 hover:border-blue-500 rounded-md p-2 h-[100px]">
                          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, index)} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-slate-400">Click to upload</span>
                          </div>
                        </div>
                      }
                      {url !== null &&
                        <div className="group relative border-2 border-slate-500 rounded-md overflow-hidden">
                          <Image draggable onDragStart={(e) => handleDragStart(e, index)} src={url} alt={`Image ${index + 1}`} width={200} height={200} className="w-full h-auto object-cover" />
                          <button className="invisible group-hover:visible absolute top-1 right-1" onClick={(e) => removeImg(e, index)}>
                            <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
                          </button>
                        </div>
                      }
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={toggleDesc} className="flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 w-full text-xl">
              Description
              <FontAwesomeIcon icon={desctoggle ? faAngleUp : faAngleDown} style={{ color: "#ffffff" }} className="h-7 flex pr-2" />
            </button>
            {desctoggle &&
              <textarea placeholder="Post description..." ref={descref} defaultValue={descvalue.current} className="w-full min-h-[100px] max-h-64 bg-slate-700 bg-opacity-30 rounded-md p-3 placeholder-slate-400 outline-none" required />
            }
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col space-y-1">
                <label htmlFor="visibility" className="text-xl pr-2">Category:</label>
                <select name="category" onChange={changeCategory} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 overflow-auto">
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
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="visibility" className="text-xl text-offwhite pr-2">Visibility:</label>
                <select id="visibility" value={visibility} onChange={changeVisibility} className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 hover:bg-opacity-10 text-offwhite">
                  <option key="public" className="text-black">Public</option>
                  <option key="private" className="text-black">Private</option>
                  {usergroups?.memberGroups.map((group: any) => (
                    <option value={group.id} key={group.id} className="text-black">{group.name}</option>
                  ))}
                  {usergroups?.adminGroups.map((group: any) => (
                    <option value={group.id} key={group.id} className="text-black">{group.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="outline-none rounded-md p-2 bg-blue-900 hover:bg-blue-800 text-offwhite">Submit</button>
          </div>
        </form>
        {modalon &&
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-end">
                <button onClick={toggleModal}>
                  <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Sign in to add images</h2>
              <button onClick={() => signIn(undefined, { callbackUrl: `/newpost` })} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition duration-300">Sign In</button>
            </div>
          </div>
        }
      </div>
    )
  }
  else {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <header className="text-offwhite text-3xl">Redirecting to your post now!</header>
      </div>
    )
  }
}