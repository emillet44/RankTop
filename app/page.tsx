import Link from "next/link";
import { Header } from "../components/headers/Header"
import { Footer } from "@/components/Footer";
import { AlgoliaUpdate } from "@/components/search/AlgoliaUpdate";
import { LoadVerified } from "@/components/serverActions/loadposts";
import { Metadata } from 'next'

//The description under the title when it shows up on Google Search
export const metadata: Metadata = {
  description: 'Create, share, and browse lists on anything and everything, ranked.',
}

//This is the homepage, very similar to /unverified and /all, but it displays verified posts by default. This is to prevent potentially NSFW posts from displaying
//as soon as the user opens the website. Currently posts have to be manually marked as verified by me. This page displays the tabs for post types, and on this page 
//specifically the "verified" tab is highlighted.
export default async function Home() {

  const posts = await LoadVerified();

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
        <ul className="flex pl-16 pt-16">
          <li className="mr-2">
            <Link href="/" aria-current="page" className="text-3xl border-b-2 border-white text-slate-400">Verified</Link>
          </li>
          <li className="mr-2">
            <Link href="/unverified" aria-current="page" className="hover:text-offwhite hover:border-b-2 border-white text-slate-400 text-3xl">Unverified</Link>
          </li>
          <li className="mr-2">
            <Link href="/all" aria-current="page" className="hover:text-offwhite hover:border-b-2 border-white text-slate-400 text-3xl">All</Link>
          </li>
        </ul>
        <div className=" pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10"> {posts?.map((list: any) => (
          <div className="outline outline-slate-700 rounded-md p-5 bg-slate-50 bg-opacity-5 hover:scale-105" key={list.id}>
            <Link href={`/post/${list.id}`}>
              <button className="h-44 w-full">
                <div className="h-44 text-left">
                <header className="capitalize text-2xl line-clamp-2 text-slate-400">{list.title}</header>
                  <ul className="list-inside list-decimal text-slate-400">
                    <li className="capitalize truncate text-slate-400">{list.rank1}</li>
                    <li className="capitalize">{list.rank2}</li>
                    <li className="capitalize empty:hidden truncate text-slate-400">{list.rank3}</li>
                    <li className="capitalize empty:hidden truncate text-slate-400">{list.rank4}</li>
                    <li className="capitalize empty:hidden truncate text-slate-400">{list.rank5}</li>
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
