import Link from "next/link"
import { SignState } from "../serverActions/signinstate"
import { Search } from "../search/SearchBox"
import { ProfileButton } from "../ProfileButton";
import { CompressedMenu } from "../CompressedMenu";


//This header is used by the /all page to display all posts, verified or not. Like every header, it also displays sign in state, and determines
//whether the user has added a username or not. If not, it will employ the AddUsername component. The states array is widely used throughout the code
//to store important states like sign in state, like state, username, email, etc. States[0] stores login state, and states[1] stores username state.
//States[2] stores the actual username. 
//The header has been revamped to scale properly now on mobile. When the header gets compressed to the sm breakpoint, the right side buttons will turn
//into a menu that is expandable and lists the three buttons vertically.

export async function Header() {

  const states: any[] = await SignState();

  return (
    <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
      <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7 text-offwhite opacity-100">RankTop</button>
        </Link>
        <Search />

        {states[0] &&
          <>
            <CompressedMenu username={states[1]}/>
            <div className="fixed flex-row right-2 top-1 gap-2 items-center hidden sm:flex">
              <Link href="/newpost">
                <button className="hover:outline outline-2 py-2 px-2 rounded-sm text-offwhite">New Post</button>
              </Link>
              <ProfileButton username={states[1]} />
            </div>
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