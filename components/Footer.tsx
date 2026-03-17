import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full h-[52px] border-t border-white/10 bg-gradient-to-t from-stone-900/80 to-stone-950/90 backdrop-blur-md relative">
      <div className="w-full h-full px-6 flex items-center justify-center">
        <div className="flex items-center justify-center gap-x-12 sm:gap-x-20 text-[13px] font-bold text-slate-400 uppercase tracking-widest h-full">
          <Link href="/about" className="hover:text-offwhite transition-colors flex items-center h-full pt-0.5">
            About
          </Link>
          <Link href="/faq" className="hover:text-offwhite transition-colors flex items-center h-full pt-0.5">
            FAQ
          </Link>
          <Link href="/feedback" className="hover:text-offwhite transition-colors flex items-center h-full pt-0.5">
            Site Feedback
          </Link>
        </div>
      </div>
    </footer>
  )
}