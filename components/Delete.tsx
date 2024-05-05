'use client'

import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useState } from "react";
import { DeletePost } from "./serverActions/deletepost";
import { useRouter } from "next/navigation"

interface Prop {
  id: string;
}

//This is a functional component that receives the id prop from post. It contains a button and confirmation modal, and when 
//the delete button is clicked the delete server action is called with the post id and the user is redirected to the homepage.
const Delete: FC<Prop> = ({id}) => {

  const [modalon, setModal] = useState(false);
  const router = useRouter();

  const toggleModal = () => {
    setModal(!modalon);
  }

  const subHandler = () => {
    DeletePost(id).then(() => {
      router.push("/");
    })
  }

  return (
    <>
      <button onClick={toggleModal} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Delete Post</button>
      {modalon &&
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="max-w-xs w-full px-2 py-2 grid grid-cols-1 grid-flow-row auto-rows-min gap-2 bg-white rounded-lg">
            <button onClick={toggleModal} className="flex justify-self-end justify-center">
              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6" />
            </button>
            <h1 className="text-3xl justify-self-center pb-2">Delete this post?</h1>
            <div className="justify-end space-x-2 w-full flex">
              <button onClick={toggleModal} className="px-4 py-2 w-24 justify-self-end bg-red-500 text-white rounded-full">Cancel</button>
              <button onClick={subHandler} className="px-4 py-2 w-24 justify-self-end bg-green-500 text-white rounded-full">Delete</button>
            </div>
          </div>
        </div>
      }
    </>
  );
}
export default Delete;