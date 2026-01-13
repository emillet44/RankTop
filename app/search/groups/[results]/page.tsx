import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { LoadGroupResults } from "@/components/serverActions/loadposts";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

//Title is set to the search results for: result for hopefully better SEO, also just more descriptive
export async function generateMetadata(props: { params: Promise<{ results: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: 'Search results for: ' + params.results
  }
}

//Get the formatting of this last search results page(users and posts already done) fixed, then work on UI or not, just make sure theres no bugs and work on marketing.

//Uses loadposts server action to load results of the search query, displayed in grid format.
export default async function Results(props: { params: Promise<{ results: string }> }) {
  const params = await props.params;

  const results = await LoadGroupResults(params.results);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <header className="text-3xl text-slate-400 pl-16 pt-16">Results</header>
        <div className="pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
          {results?.map((group) => (
            <div className="outline outline-slate-700 rounded-md p-5 bg-slate-50 bg-opacity-5 hover:scale-105 transition-transform duration-200" key={group.id}>
              <Link href={`/group/${group.id}`}>
                <div className="h-44 w-full flex flex-col">
                  {group.bannerimg && (
                    <div className="h-16 -mx-5 -mt-5 mb-3 bg-slate-800 relative overflow-hidden rounded-t-md">
                      <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}banner.png`} alt={`${group.name} banner`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center mb-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3 bg-slate-700">
                      {group.profileimg ? (
                        <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}profile.png`} alt={`${group.name}'s profile`} className="h-full w-full object-cover" />
                      ) : (
                        <label>Profile</label>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h2 className="text-xl font-medium text-slate-300 truncate mr-2">{group.name}</h2>
                        {group.private && (
                          <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Private</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-2 text-sm">
                        <span>Created:</span>
                        <span>{new Date(group.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-slate-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                          </svg>
                          <span className="text-slate-300">{group.population} {group.population === 1 ? 'member' : 'members'}</span>
                        </div>
                        <div className="text-sm px-2 py-0.5 rounded bg-slate-800 text-slate-300">{group.invite ? 'By invite' : (group.password ? 'Password' : 'Open')}</div>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center text-slate-300 text-sm">
                      <span className="mr-1">View group</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}