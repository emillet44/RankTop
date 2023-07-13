import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from 'next/link'
import prisma from '../lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { Logout } from "./logout"



export default async function Home() {
  let signedin = false;
  const post = await prisma.post.findMany({
    where: { verified: false},
  });

  const session = await getServerSession(authOptions);

  if (session) {
    signedin = true;
  }


  return (
    <>
      <div className="flex justify-center pt-14 pb-4 md:py-2 bg-slate-500">
        <div className="grid grid-flow-col outline outline-2 rounded-md p-1">
          <Link href="/">
            <button className="absolute left-2 top-3 text-4xl/7">DIGBTT</button>
          </Link>
          <input type="text" placeholder="Search" className= "w-80 h-7 bg-slate-500 outline-none p-1 peer"/>
          <button className="peer-placeholder-shown:invisible">
            <FontAwesomeIcon icon={faXmark} className="w-6 h-7"/>
          </button>
          { !signedin &&
          <Link href="/api/auth/signin">
            <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
          </Link>
          }
          { !signedin &&
          <Link href="/newpost">
            <button className="absolute right-20 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
          </Link>
          }
          { signedin &&
            <Logout />
          }
          { signedin &&
            <Link href="/newpost">
              <button className="absolute right-24 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
            </Link>
          }
          
        </div>
      </div>

      <div className=" pt-20 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10"> {post.map((list) => (
        <div key={list.id}>
          <button className="outline rounded-md h-52 w-full"> 
            <form className="h-52 p-5 text-left">
              <header className="capitalize text-2xl">{list.title}</header>
                <ul className="list-inside list-decimal">
                  <li className="capitalize">{list.rank1}</li>
                  <li className="capitalize">{list.rank2}</li>
                  <li className="capitalize empty:hidden">{list.rank3}</li>
                  <li className="capitalize empty:hidden">{list.rank4}</li>
                  <li className="capitalize empty:hidden">{list.rank5}</li>
                </ul>
            </form>
          </button>
        </div>
        ))}
      </div>
    </>
    
  )
}
