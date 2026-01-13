import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { LoadPostResults } from "@/components/serverActions/loadposts";
import { Metadata } from "next";
import Link from "next/link";

//Title is set to the search results for: result for hopefully better SEO, also just more descriptive
export async function generateMetadata(props: { params: Promise<{ results: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: 'Search results for: ' + params.results
  }
}

//Uses loadposts server action to load results of the search query, displayed in grid format.
export default async function Results(props: { params: Promise<{ results: string }> }) {
  const params = await props.params;

  const results = await LoadPostResults(params.results);

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
                  <header className="text-2xl line-clamp-2 text-slate-400">{list.title}</header>
                  <ul className="list-inside list-decimal text-slate-400">
                    <li className="truncate text-slate-400">{list.rank1}</li>
                    <li className="truncate text-slate-400">{list.rank2}</li>
                    <li className="empty:hidden truncate text-slate-400">{list.rank3}</li>
                    <li className="empty:hidden truncate text-slate-400">{list.rank4}</li>
                    <li className="empty:hidden truncate text-slate-400">{list.rank5}</li>
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