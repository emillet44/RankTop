import Link from "next/link"
import { Logout } from "./logout"
import { SignState } from "./signinstate";
import { AddUsername } from "./AddUsername";

export async function Header() {

  const states: boolean[] = await SignState();

  return (
    <div className="flex justify-center pt-12 pb-1 bg-slate-500">
      <Link href="/">
        <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
      </Link>
      {states[1] && states[0] &&
        <label className="absolute right-52 top-3.5">{states[2]}</label>
      }
      {!states[1] && states[0] &&
        <>
          <div className="absolute right-24 top-1.5 flex justify-center">
            <AddUsername />
          </div>
        </>
      }
      {states[0] &&
        <Logout />
      }
      {!states[0] &&
        <Link href="/api/auth/signin">
          <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
        </Link>
      }
    </div>
  )
}