import Link from "next/link"
import { Logout } from "../logout";
import { SignState } from "../serverActions/signinstate";
import { AddUsername } from "../AddUsername";
import { Search } from "../search/SearchBox";


//This header is used by the /newpost page. It only exists to hide the "New Post" button whenever the user is already on the "New Post" page. Like every 
//header, it also displays sign in state, and determines whether the user has added a username or not. If not, it will employ the AddUsername component. 
//The states array is widely used throughout the code to store important states like sign in state, like state, username, email, etc. States[0] stores 
//login state, and states[1] stores username state. States[2] stores the actual username.
export async function Header() {

  const states: boolean[] = await SignState();

  return (
    <div className="flex justify-center pt-14 pb-2 md:py-2 bg-slate-500">
      <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7">RankTop</button>
        </Link>
        <Search />
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
    </div>
  )
}