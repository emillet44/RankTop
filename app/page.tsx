import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="flex justify-center pt-14 pb-4 md:py-2 bg-slate-500">
        <form className="grid grid-flow-col outline outline-2 rounded-md p-1">
          <Link href="/">
            <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
          </Link>
          <input type="text" placeholder="Search" className= "w-80 h-7 bg-slate-500 outline-none p-1"/>
          <button>
            <FontAwesomeIcon icon={faXmark} className="w-6 h-7"/>
          </button>
          <Link href="/signin">
            <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
          </Link>
          <Link href="/newpost">
            <button className="absolute right-20 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
          </Link>
        </form>
      </div>

      <div className=" pt-20 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
        <button className="outline rounded-md h-52 w-50">
          <form className="h-52 p-5 text-left">
            <header className="capitalize text-2xl">best nvidia AIB partners</header>
            <ul className="list-inside list-decimal">
              <li className="capitalize">asus</li>
              <li className="capitalize">gigabyte</li>
              <li className="capitalize">mSI</li>
            </ul>
          </form>
        </button>
        <button className="outline rounded-md">List Title</button>
        <button className="outline rounded-md">List Title</button>
        <button className="outline rounded-md">List Title</button>
        <button className="outline rounded-md">List Title</button>
      </div>
    </>
    
  )
}
