'use client'

import { useState } from "react";
import { CreateUsername, UniqueUsername } from "./serverActions/username";
import { useRouter } from "next/navigation";

//This function starts by initializing state variables and the Nextjs router. When the "Add Username" button is clicked, the toggleForm function is called
//which opens the form if it was closed, or closes all the forms if any were open. As soon as the user types in the input, characters are validated using
//regex in checkChars, replacing invalid characters with "". When the continue button is clicked, checkUnique is called, which either displays the notunique
//form that says the username is already taken, or the confirmopen form, that asks if the user is sure of this username as its permanent, and displays a back
//and submit button. If the back button is clicked, the base form with the username input is shown again, and if the submit button is clicked, newUsername
//is called which adds the username to the database and silently refreshes the page(similar to ctrl + r but the page never goes blank) to display the username.
export function AddUsername() {

  const [formopen, setFormOpen] = useState(Boolean);
  const [confirmopen, setConfirmation] = useState(Boolean);
  const [notunique, setNotunique] = useState(Boolean);
  const [inputValue, setInputValue] = useState('');
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();

  const toggleForm = (e: any) => {
    e.preventDefault();
    if (formopen) {
      setFormOpen(false);
      setConfirmation(false);
      setNotunique(false);
    }
    else {
      setFormOpen(true);
    }
  }

  const back = (e: any) => {
    e.preventDefault();
    if(e.target.value == "uniqueback") {
      setNotunique(false);
    }
    else {
      setConfirmation(false);
    }
  }

  const checkUnique = (e:any) => {
    e.preventDefault();

    UniqueUsername(inputValue).then((result) => {
      if (result) {
        setNotunique(true);
        setConfirmation(false);
      }
      else {
        setNotunique(false);
        setConfirmation(true);
      }
    })    
  }

  const checkChars = (e: any) => {
    const result = e.target.value.replace(/[^a-z0-9-_]/gi, '');
    setInputValue(result);
    if(e.target.value !== "") {
      setDisabled(false);
    }
    else {
      setDisabled(true);
    }
  }

  const newUsername = (e:any) => {
    CreateUsername(inputValue).then((result) => {
      router.refresh();
    });
  }

  return (
    <>
      <button onClick={toggleForm} className="hover:outline outline-2 py-2 px-2 rounded-sm peer">Add Username</button>
      {formopen && !confirmopen && !notunique &&
        <div className="absolute top-32 lg:top-20 outline outline-slate-700 rounded-lg w-64 p-4">
          <div className="grid grid-cols-1 gap-2 grid-flow-row auto-rows-auto">
            <label className="text-slate-400">Username</label>
            <input name="username" id="username" value={inputValue} onChange={checkChars} className="outline outline-2 outline-slate-700 rounded-sm bg-transparent text-offwhite" maxLength={24}></input>
            <div className="flex justify-end">
              <button type="submit" onClick={checkUnique} disabled={disabled} className="outline outline-2 outline-slate-700 rounded-sm w-20 disabled:bg-red-900 bg-slate-50 bg-opacity-5 text-slate-400">Continue</button>
            </div>
          </div>
        </div>
      }
      {notunique &&
        <div className="absolute top-20 outline rounded-lg w-64 p-4">
        <div className="grid grid-cols-1 gap-2 grid-flow-row auto-rows-auto">
          <label>Username Taken</label>
          <button value="uniqueback" onClick={back} className="outline outline-2 rounded-sm w-24">Try Another</button>
        </div>
      </div>
      }
      {confirmopen &&
        <div className="absolute top-20 outline outline-slate-700 rounded-lg w-64 p-4">
          <div className="grid grid-cols-2 gap-2 grid-flow-row auto-rows-auto">
            <label className="text-slate-400">{inputValue}</label>
            <label className="col-span-2 text-slate-400">This will be your permanent username. Are you sure?</label>
            <button onClick={back} className="outline outline-2 outline-slate-700 rounded-sm w-16 bg-slate-50 bg-opacity-5 text-slate-400">Back</button>
            <div className="col-start-2 flex justify-end">
              <button onClick={newUsername} className="outline outline-2 outline-slate-700 rounded-sm w-16 bg-slate-50 bg-opacity-20 text-slate-400">Submit</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}