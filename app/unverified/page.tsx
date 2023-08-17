import Link from "next/link";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadUnverified } from "@/components/serverActions/loadposts";

//This page imports a different header that contains a search box specifically for searching unverified posts. This functionality may change
//to a unified search box to reduce the number of excess one off headers. This page displays the tabs for post types, and on this page specifically
//the "unverified" tab is highlighted.
export default async function UnverifiedPosts() {

  const posts = await LoadUnverified();

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-116px)] pb-16">
        <ul className="flex pl-16 pt-16">
          <li className="mr-2">
            <Link href="/" aria-current="page" className="hover:text-red-500 hover:border-b-2 border-neutral-400 text-3xl">Verified</Link>
          </li>
          <li className="mr-2">
            <Link href="/unverified" aria-current="page" className="hover:text-red-500 text-3xl border-b-2 border-black">Unverified</Link>
          </li>
          <li className="mr-2">
            <Link href="/all" aria-current="page" className="hover:text-red-500 hover:border-b-2 border-neutral-400 text-3xl">All</Link>
          </li>
        </ul>
        <div className=" pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10"> {posts?.map((list: any) => (
          <div className="outline rounded-md p-5 pb-4" key={list.id}>
            <Link href={`/post/${list.id}`}>
              <button className="h-40 w-full">
                <div className="h-40 text-left">
                  <header className="capitalize text-2xl">{list.title}</header>
                  <ul className="list-inside list-decimal">
                    <li className="capitalize">{list.rank1}</li>
                    <li className="capitalize">{list.rank2}</li>
                    <li className="capitalize empty:hidden">{list.rank3}</li>
                    <li className="capitalize empty:hidden">{list.rank4}</li>
                    <li className="capitalize empty:hidden">{list.rank5}</li>
                  </ul>
                </div>
              </button>
            </Link>
          </div>
        ))}
        </div>
      </div>
      
      <Footer />
    </>
  )
}