import Link from "next/link";

export function Footer() {
  return (
    <>
      <footer className="py-5 w-full text-center bg-slate-500">
        <div className="grid grid-flow-col auto-cols-auto">
          <Link href="/about">
            <header className="">About</header>
          </Link>
          <Link href="/faq">
            <header className="">FAQ</header>
          </Link>
          <Link href="/bugs">
            <header className="">Report Bugs</header>
          </Link>
        </div>
      </footer>
    </>
  )
}