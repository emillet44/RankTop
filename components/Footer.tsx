import Link from "next/link";

//This function just holds the links to common pages like About, FAQ, and Report Bugs, and is the same size as the header.
export function Footer() {
  return (
    <>
      <footer className="py-3 w-full text-center bg-slate-500">
        <div className="grid grid-flow-col auto-cols-auto justify-center gap-10 sm:gap-40 h-10 items-center">
          <Link href="/about" className="w-20 py-2">
            <header>About</header>
          </Link>
          <Link href="/faq" className="w-16 py-2">
            <header>FAQ</header>
          </Link>
          <Link href="/feedback" className="w-36 py-2">
            <header>Site Feedback</header>
          </Link>
        </div>
      </footer>
    </>
  )
}