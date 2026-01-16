import Link from "next/link"
import { getSessionData } from "@/lib/auth-helpers";
import { Search } from "../search/SearchBox";
import { ProfileMenu } from "../ProfileMenu";

export async function Header() {
  const { signedin, username, userid } = await getSessionData();

  return (
    <div className="fixed w-screen flex justify-center pt-14 pb-2 md:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80% z-[100]">
      <div className="grid grid-flow-col min-w-[300px] h-9 justify-center items-center">
        <Link href="/home">
          <button className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite tracking-tighter">
            RankTop
          </button>
        </Link>

        <Search />

        <div className="absolute right-2 top-1.5 flex items-center space-x-2">
          <Link href="/groups">
            <button className="hover:outline outline-1 outline-slate-700 py-2 px-3 rounded-md text-sm sm:text-base text-offwhite transition-all">
              Groups
            </button>
          </Link>

          {signedin ? (
            <div className="z-[110]">
              <ProfileMenu username={username} userid={userid} />
            </div>
          ) : (
            <Link href="/signin">
              <button className="hover:bg-blue-600 outline outline-1 outline-blue-600 py-2 px-4 rounded-md text-offwhite transition-all font-semibold">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}