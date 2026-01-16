import Link from "next/link"
import { getSessionData } from "@/lib/auth-helpers";
import { Search } from "../search/SearchBox"
import { ProfileMenu } from "../ProfileMenu";

/**
 * Main Header
 * Uses getSessionData (optimized for NextAuth) to determine if a user
 * is authenticated and passes the username/userid to the ProfileMenu.
 */
export async function Header() {
  const { signedin, username, userid } = await getSessionData();

  return (
    <div className="fixed w-screen flex justify-center pt-14 pb-2 md:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80% z-[100]">
      <div className="grid grid-flow-col min-w-[300px] h-9 justify-center items-center">
        {/* Logo */}
        <Link href="/home">
          <button className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite font-bold tracking-tighter hover:text-blue-400 transition-colors">
            RankTop
          </button>
        </Link>

        {/* Global Search Component */}
        <Search />

        {signedin ? (
          /* AUTHENTICATED STATE */
          <div className="w-[calc(100vw-140px)] md:min-w-[230px] md:w-[calc(50vw-160px)] absolute justify-end flex-row right-2 2xl:right-4 md:top-1 top-[7px] items-center flex gap-2">
            <Link href="/newpost">
              <button className="hover:outline outline-1 outline-slate-700 py-2 px-3 rounded-md text-sm sm:text-base text-offwhite whitespace-nowrap bg-white/5 transition-all">
                New Post
              </button>
            </Link>
            
            <div className="z-[110]">
              {/* ProfileMenu now receives actual username from session */}
              <ProfileMenu username={username} userid={userid} />
            </div>
          </div>
        ) : (
          /* GUEST STATE */
          <div className="absolute right-2 top-1.5 flex gap-2">
            <Link href="/newpost">
              <button className="hidden sm:block hover:outline outline-1 outline-slate-700 py-2 px-3 rounded-md text-offwhite bg-white/5 transition-all">
                New Post
              </button>
            </Link>
            <Link href="/signin">
              <button className="hover:bg-blue-600 outline outline-1 outline-blue-600 py-2 px-4 rounded-md text-offwhite transition-all font-semibold">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}