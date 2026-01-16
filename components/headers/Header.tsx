import Link from "next/link"
import { getSessionData } from "@/lib/auth-helpers";
import { Search } from "../search/SearchBox"
import { ProfileMenu } from "../ProfileMenu";
import { CompressedMenu } from "../CompressedMenu";

export async function Header() {
  const { signedin, username, userid } = await getSessionData();

  return (
    <div className="fixed w-screen flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80% z-[100]">
      <div className="grid grid-flow-col min-w-[300px] h-9 justify-center items-center">
        {/* Logo */}
        <Link href="/home">
          <button className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite font-bold tracking-tighter transition-colors hover:text-blue-400">
            RankTop
          </button>
        </Link>

        {/* Search */}
        <Search />

        {/* Mobile Menu */}
        <CompressedMenu signedin={signedin} username={username} />

        {/* Desktop Actions */}
        <div className="hidden min-[490px]:flex absolute right-2 2xl:right-4 top-1 lg:top-1.5 items-center space-x-2">
          <Link href="/groups">
            <button className="hover:outline outline-1 outline-slate-700 py-2 px-3 rounded-md text-offwhite bg-white/5 transition-all">
              Groups
            </button>
          </Link>
          <Link href="/newpost">
            <button className="hover:outline outline-1 outline-slate-700 py-2 px-3 rounded-md text-offwhite whitespace-nowrap bg-white/5 transition-all">
              New Post
            </button>
          </Link>

          {signedin ? (
            <div className="z-[110]">
              <ProfileMenu username={username} userid={userid} />
            </div>
          ) : (
            <Link href="/signin">
              <button className="bg-blue-600 hover:bg-blue-500 outline outline-1 outline-blue-600 py-2 px-4 rounded-md text-offwhite transition-all font-semibold">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}