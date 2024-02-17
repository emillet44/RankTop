import Link from "next/link";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadAll } from "@/components/serverActions/loadposts";

//This page imports a different header that contains a search box specifically for searching all posts. This functionality may change
//to a unified search box to reduce the number of excess one off headers. This page displays the tabs for post types, and on this page specifically
//the "all" tab is highlighted.
export default async function AllPosts() {

  const posts = await LoadAll();

  return (
    <>
      <Header />
      <div className="flex justify-center pb-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="grid grid-cols-1 w-full max-w-2xl">
          <ul className="flex pt-6 justify-center border-x border-b border-slate-700">
            <li className="mr-2">
              <Link href="/" aria-current="page" className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">Verified</Link>
            </li>
            <li className="mr-2">
              <Link href="/unverified" aria-current="page" className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">Unverified</Link>
            </li>
            <li className="mr-2">
              <Link href="/all" aria-current="page" className="text-3xl border-b-2 border-white text-slate-400">All</Link>
            </li>
          </ul>
          <div className="grid grid-cols-1 justify-items-center auto-rows-min"> {posts?.map((list: any) => (
            <Link href={`/post/${list.id}`} className="w-full" key={list.id}>
              <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 border-x border-b border-slate-700">
                <header className="capitalize text-4xl line-clamp-2 text-slate-400">{list.title}</header>
                <li className="capitalize truncate text-xl text-slate-400">{list.rank1}</li>
                <li className="capitalize truncate text-xl text-slate-400">{list.rank2}</li>
                <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank3}</li>
                <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank4}</li>
                <li className="capitalize empty:hidden truncate text-xl text-slate-400">{list.rank5}</li>
              </ul>
            </Link>
          ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}