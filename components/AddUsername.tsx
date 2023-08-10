'use client'

import { useState } from "react";
import { CreateUsername, UniqueUsername } from "./signinstate";
import { useRouter } from "next/navigation";


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
        <div className="absolute top-20 outline rounded-lg w-64 p-4">
          <div className="grid grid-cols-1 gap-2 grid-flow-row auto-rows-auto">
            <label>Username</label>
            <input name="username" id="username" value={inputValue} onChange={checkChars} className="outline outline-2 rounded-sm" maxLength={24}></input>
            <div className="flex justify-end">
              <button type="submit" onClick={checkUnique} disabled={disabled} className="outline outline-2 rounded-sm w-20 disabled:bg-red-600">Continue</button>
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
        <div className="absolute top-20 outline rounded-lg w-64 p-4">
          <div className="grid grid-cols-2 gap-2 grid-flow-row auto-rows-auto">
            <label>{inputValue}</label>
            <label className="col-span-2">This will be your permanent username. Are you sure?</label>
            <button onClick={back} className="outline outline-2 rounded-sm w-16">Back</button>
            <div className="col-start-2 flex justify-end">
              <button onClick={newUsername} className="outline outline-2 rounded-sm w-16">Submit</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}