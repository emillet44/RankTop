import Link from "next/link"
import { SignState } from "../serverActions/signinstate";
import { Search } from "../search/SearchBox";
import { ProfileMenu } from "../ProfileMenu";


//This header is used by the /newpost page. It only exists to hide the "New Post" button whenever the user is already on the "New Post" page. Like every 
//header, it also displays sign in state, and determines whether the user has added a username or not. If not, it will employ the AddUsername component. 
//The states array is widely used throughout the code to store important states like sign in state, like state, username, email, etc. States[0] stores 
//login state, and states[1] stores username state. States[2] stores the actual username.
export async function Header() {

  const states: any[] = await SignState();

  return (
    <div className="fixed w-screen flex justify-center pt-14 pb-2 md:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80% z-10">
      <div className="grid grid-flow-col min-w-[300px] h-9 justify-center">
        <Link href="/">
          <button className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
        </Link>
        <Search />
        {states[0] &&
          <div className="w-[calc(100vw-140px)] md:min-w-[230px] lg:w-[calc(50vw-160px)] absolute justify-end flex-row right-2 2xl:right-4 lg:top-1 top-[7px] items-center flex">
            <Link href="/groups">
              <button className="hover:outline outline-2 p-2 rounded-sm text-sm sm:text-base text-offwhite">Groups</button>
            </Link>
            <div className="z-50">
              <ProfileMenu username={states[1]} userid={states[2]} />
            </div>
          </div>
        }
        {!states[0] &&
          <div className="absolute right-2 top-1.5 flex flex-row space-x-2">
            <Link href="/groups">
              <button className="hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">Groups</button>
            </Link>
            <Link href="/api/auth/signin">
              <button className="hover:outline outline-2 p-2 rounded-sm text-offwhite">Sign In</button>
            </Link>
          </div>
        }
      </div>
    </div>
  )
}