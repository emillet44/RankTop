import Link from "next/link"
import { getSessionData } from "@/lib/auth-helpers";
import { Search } from "../search/SearchBox"
import { ProfileMenu } from "../ProfileMenu";
import { CompressedMenu } from "../CompressedMenu";

/**
 * Group Header
 * Mirror of main Header but used in Group-related pages.
 */
export async function Header() {
  const { signedin, username, userid } = await getSessionData();

  return (
    <nav className="fixed top-0 left-0 right-0 h-[52px] flex items-center bg-gray-950/50 backdrop-blur-md border-b border-white/10 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="w-full px-4 md:px-6 flex items-center justify-between relative h-full">
        {/* Left: Logo - Switches to "R" on tiny screens */}
        <div className="flex-1 flex items-center min-w-0">
          <Link href="/home" className="text-2xl md:text-3xl text-offwhite tracking-tightest hover:text-blue-400 transition-colors font-bold">
            <span className="hidden min-[450px]:inline">RankTop</span>
            <span className="min-[450px]:hidden">R</span>
          </Link>
        </div>

        {/* Center: Search - More flexible scaling */}
        <div className="flex-none w-full max-w-[200px] min-[400px]:max-w-[280px] sm:max-w-[380px] md:max-w-[420px] mx-2">
          <Search />
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-x-2 md:gap-x-3">
          <div className="hidden md:flex items-center gap-x-2 md:gap-x-3">
            <Link 
              href="/newpost" 
              className="h-8 flex items-center px-4 rounded text-[13px] font-bold bg-white/5 border border-white/10 text-offwhite hover:bg-white/10 transition-all capitalize tracking-normal"
            >
              New post
            </Link>
            {signedin ? (
              <div className="relative z-[110]">
                <ProfileMenu username={username} userid={userid} />
              </div>
            ) : (
              <Link href="/signin">
                <button className="h-8 flex items-center px-5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold text-[13px] capitalize tracking-normal border border-transparent">
                  Sign in
                </button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <CompressedMenu signedin={signedin} username={username} />
          </div>
        </div>
      </div>
    </nav>
  );
}
