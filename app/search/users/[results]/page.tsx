import { Footer } from "@/components/Footer";
import { Header } from "@/components/headers/Header";
import { LoadUserResults } from "@/components/serverActions/loadposts";
import Link from "next/link";
import profilepic from "../../../../pfp.png";
import Image from 'next/image';
import { Metadata } from "next";

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
  const results = await LoadUserResults(params.results);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] pt-14 bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <header className="text-3xl text-slate-400 pl-16 pt-16">Results</header>
        <div className="pt-4 px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
          {results?.map((user) => (
            <div
              className="outline outline-slate-700 rounded-md p-5 bg-slate-50 bg-opacity-5 hover:scale-105 transition-transform duration-200"
              key={user.id}
            >
              <Link href={`/user/${user.username}`}>
                <div className="h-44 w-full flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden mr-3 bg-slate-700">
                      <Image src={profilepic} alt="Default profile" fill className="object-cover" />
                    </div>
                    <div>
                      <h2 className="text-xl font-medium text-slate-300 truncate max-w-[160px]">
                        {user.username}
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Joined:</span>
                        <span>{new Date(user.joindate).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 text-slate-400 gap-2">
                        <div className="flex flex-col items-center p-2 rounded bg-slate-800 bg-opacity-30">
                          <span className="text-lg font-semibold">{user.followerCount}</span>
                          <span className="text-xs">Followers</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded bg-slate-800 bg-opacity-30">
                          <span className="text-lg font-semibold">{user.followingCount}</span>
                          <span className="text-xs">Following</span>
                        </div>
                      </div>
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