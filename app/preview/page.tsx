import Link from "next/link";

export default function Preview() {

    return (
      <>
        <div className="flex justify-center py-7 bg-slate-500">
        <Link href="/">
          <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
        </Link>
        <Link href="/signin">
          <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
        </Link>
      </div>
      </>
      
    )
  }
  