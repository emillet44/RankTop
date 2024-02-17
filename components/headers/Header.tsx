import Link from "next/link"
import { Logout } from "../Logout"
import { SignState } from "../serverActions/signinstate"
import { AddUsername } from "../AddUsername"
import { Search } from "../search/SearchBox"

//This header is used by the /all page to display all posts, verified or not. Like every header, it also displays sign in state, and determines
//whether the user has added a username or not. If not, it will employ the AddUsername component. The states array is widely used throughout the code
//to store important states like sign in state, like state, username, email, etc. States[0] stores login state, and states[1] stores username state.
//States[2] stores the actual username.
export async function Header() {

  const states: any[] = await SignState();

  return (
    <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
      <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7 text-offwhite opacity-100">RankTop</button>
        </Link>
        <Search />
        {states[1] && states[0] &&
          <label className="absolute right-52 top-3.5 text-offwhite">{states[2]}</label>
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
              <button className="absolute right-24 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">New Post</button>
            </Link>
          </>
        }
        {!states[0] &&
          <>
            <Link href="/api/auth/signin">
              <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">Sign In</button>
            </Link>
            <Link href="/newpost">
              <button className="absolute right-20 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">New Post</button>
            </Link>
          </>
        }
      </div>
    </div>
  )
}