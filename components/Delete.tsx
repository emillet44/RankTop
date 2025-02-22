'use client'

import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { DeletePost } from "./serverActions/deletepost";
import { useRouter } from "next/navigation"

//This is a functional component that receives the id prop from post. It contains a button and confirmation modal, and when 
//the delete button is clicked the delete server action is called with the post id and the user is redirected to the homepage.
export function Delete({ id }: { id: string }) {

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



      <button onClick={toggleModal} className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 h-10 whitespace-nowrap">Delete</button>
      {modalon &&
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-1 w-80 flex flex-col items-center">
            <button onClick={toggleModal} className="flex w-full justify-end">
              <FontAwesomeIcon icon={faCircleXmark} className="w-6 h-6 text-slate-400 hover:text-slate-200" />
            </button>
            <h1 className="text-slate-300 text-2xl font-bold text-center mb-4 px-4">Delete this post?</h1>
            <button onClick={subHandler} className="my-2 w-72 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full">Delete</button>

          </div>
        </div>
      }
    </>
  );
}