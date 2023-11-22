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
      <div className="flex justify-center pb-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
        <div className="grid grid-cols-1 w-full max-w-2xl">
          <ul className="flex pt-6 pb-8 justify-center border-x border-b border-slate-700">
            <li className="mr-2">
              <Link href="/" aria-current="page" className="text-3xl border-b-2 border-white text-slate-400">Verified</Link>
            </li>
            <li className="mr-2">
              <Link href="/unverified" aria-current="page" className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">Unverified</Link>
            </li>
            <li className="mr-2">
              <Link href="/all" aria-current="page" className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">All</Link>
            </li>
          </ul>
          <div className="grid grid-cols-1 justify-items-center"> {posts?.map((list: any) => (
            <Link href={`/post/${list.id}`} className="w-full">
              <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 border-x border-b border-slate-700" key={list.id}>
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
