import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { Logout } from "./logout"
import { SignState } from "./signinstate"
import { AddUsername } from "./AddUsername"

export async function Header() {

  const states: any[] = await SignState();

  return (
    <div className="flex justify-center pt-14 md:py-2 bg-slate-500">
      <div className="grid grid-flow-col outline outline-2 rounded-md p-1">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
        </Link>
        <input type="text" placeholder="Search" className="w-80 h-7 bg-slate-500 outline-none pl-1 peer" />
        <button className="peer-placeholder-shown:invisible">
          <FontAwesomeIcon icon={faXmark} className="w-6 h-6 flex justify-center" />
        </button>
        {states[1] && states[0] &&
          <label className="absolute right-52 top-3.5">{states[2]}</label>
        }
        {!states[1] && states[0] &&
          <>
            <div className="absolute right-48 top-1.5 flex justify-center">
              <AddUsername />
            </div>
          </>
        }
        {states[0] &&
          <>
            <Logout />
            <Link href="/newpost">
              <button className="absolute right-24 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
            </Link>
          </>
        }
        {!states[0] &&
          <>
            <Link href="/api/auth/signin">
              <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
            </Link>
            <Link href="/newpost">
              <button className="absolute right-20 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
            </Link>
          </>
        }
      </div>
    </div>
  )
}