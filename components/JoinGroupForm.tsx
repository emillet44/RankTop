'use client'

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react";
import { FindGroup } from "./serverActions/addtogroup";
import Link from "next/link";

export function JoinGroupForm({ signedin, userid }: { signedin: boolean, userid: string }) {

  const [passwordType, setPasswordType] = useState("password");
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const subHandler = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("userid", userid);
    setSubmitted(true);

    FindGroup(formData).then((result: any) => {
      setMessage(result);
    });
  }

  const toggleVisibility = (e: any) => {
    e.preventDefault();
    setVisible(!visible);
    setPasswordType(prev => prev === "password" ? "text" : "password");
  }

  const resetForm = (e: any) => {
    e.preventDefault();
    setSubmitted(false);
    setMessage("");
  }


  return (
    <form id="newgroup" onSubmit={subHandler} className="flex justify-center pt-[70px] md:pt-[22px] px-6 pb-10">
      <div className="grid grid-cols-1 gap-6 p-6 rounded-xl shadow-black shadow-lg bg-slate-500 bg-opacity-20 w-full max-w-2xl">
        {signedin &&
          <>
            {!submitted &&
              <>
                <header className="text-3xl font-bold text-center">Join Group</header>
                <div className="space-y-2">
                  <label htmlFor="groupname" className="text-xl">Group name</label>
                  <input name="groupname" className="w-full px-3 py-2 text-lg bg-slate-600 bg-opacity-30 rounded-md outline-none focus:ring-2 focus:ring-blue-500" required pattern=".*\S.*" maxLength={40} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xl">Password</label>
                  <div className="relative">
                    <input name="password" type={passwordType} className="w-full px-3 py-2 pr-10 text-lg bg-slate-600 bg-opacity-30 rounded-md outline-none focus:ring-2 focus:ring-blue-500" required pattern="\S+" maxLength={24} />
                    <button onClick={toggleVisibility} className="absolute inset-y-0 right-0 px-3 flex items-center" type="button">
                      <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="w-5" />
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-blue-900 hover:bg-blue-800 text-lg font-semibold rounded-md">Join Group</button>
              </>
            }
            {submitted &&
              <>
                {message === "" &&
                  <header className="text-xl text-center">Searching for group...</header>
                }
                {message === "none" &&
                <>
                  <header className="text-xl text-center">Incorrect group name and/or password</header>
                  <button onClick={resetForm} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-lg font-semibold rounded-md">Try Again</button>
                </>                  
                }
                {message === "many" &&
                  <header className="text-xl text-center">Wow! Multiple groups have this exact name and password. If the group is public, please use the search bar to locate and join the group, otherwise please send a report through site feedback for it to be resolved.</header>
                }
                {message === "member" &&
                <>
                  <header className="text-xl text-center">You are already a member or admin of this group</header>
                  <button onClick={resetForm} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-lg font-semibold rounded-md">Back</button>
                </>
                }
                {message.includes("success") &&
                  <>
                    <header className="text-xl text-center">Joined group!</header>
                    <div className="flex w-full justify-center">
                      <Link href={`/group/${message.substring(7)}`} className="w-min whitespace-nowrap py-2 px-4 bg-blue-900 hover:bg-blue-800 text-lg text-center font-semibold rounded-md">Group Homepage</Link>
                    </div>
                  </>
                }
                {message === "fail" &&
                <>
                  <header className="text-xl text-center">A server error occurred, please retry.</header>
                  <button onClick={resetForm} className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-lg font-semibold rounded-md">Try Again</button>
                </>
                }
              </>
            }
          </>
        }
        {!signedin &&
          <div className="p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Sign in to join a group</h2>
            <Link href="/signin" className="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600">Sign In</Link>
          </div>
        }

      </div>
    </form>
  )
}