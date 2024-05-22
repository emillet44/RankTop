import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { LoadResults } from "@/components/serverActions/loadposts";
import Link from "next/link";

//Title is set to the search results for: result for hopefully better SEO, also just more descriptive
export async function generateMetadata({ params }: { params: { results: string } }) {
  return {
    title: 'Search results for: ' + params.results
  }
}

//Uses loadposts server action to load results of the search query, in the same format as they are displayed on the homepage.
export default async function Results({ params }: { params: { results: string } }) {

  const results = await LoadResults(params.results);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <header className="text-3xl text-slate-400 pl-16 pt-16">Results</header>
        <div className=" pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10"> {results?.map((list: any) => (
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