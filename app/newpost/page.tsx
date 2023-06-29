import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from 'next/link'

export default function Post() {
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

      <div className="flex justify-center">
        <form method="post" className="py-20 grid grid-cols-1 grid-rows-8 gap-10 w-full max-w-3xl px-6">
            <header className="text-3xl justify-self-left ">New Post</header>
            <input type="text" placeholder="List Title" className="outline outline-2 justify-self-center rounded-sm w-full h-9 pl-2"></input>
            <input type="text" placeholder="Rank #1" className="outline outline-2 justify-self-center rounded-sm h-9 w-full pl-2"></input>
            <input type="text" placeholder="Rank #2" className="outline outline-2 justify-self-center rounded-sm h-9 w-full pl-2"></input>
            <input type="text" placeholder="Rank #3" className="outline outline-2 justify-self-center rounded-sm h-9 w-full pl-2"></input>
            <input type="text" placeholder="Rank #4" className="outline outline-2 justify-self-center rounded-sm h-9 w-full pl-2"></input>
            <input type="text" placeholder="Rank #5" className="outline outline-2 justify-self-center rounded-sm h-9 w-full pl-2"></input>
            <div className="justify-self-end space-x-5">
              <Link href="/preview" className="outline outline-2 rounded-md p-2">
                <button type="submit">Preview</button>
              </Link>
              <Link href="/submitted" className="outline outline-2 rounded-md p-2">
                <button type="submit">Submit</button>
              </Link>
            </div>
        </form>
      </div>
    </>
  )
}