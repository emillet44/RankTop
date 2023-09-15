import { AddLike } from "@/components/AddLike";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { runReport } from "@/components/serverActions/pageview";

//This is a dynamic page that displays posts when users click on them from homepage, unverified, or all, or after they submit a post. 
//It recieves the post id as a parameter and fetches the post using the findUnique Prisma API. Then it creates a Google Analytics report on the current
//post id to fetch the total number of pageviews this page has(temp solution, better to populate database with views instead). It calls its own "PostHeader"
//(slightly different than other headers, needed to be another component), and AddLikes to manage the like state and the like counter. It will also conditionally
//render "Explanation" if there is an explanation or not.
export default async function Post({ params }: { params: { id: string } }) {

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  const views = await runReport(`/post/${params.id}`);
  
  if (post !== null) {
    return (
      <>
        <Header />

        <div className="flex justify-center pt-16 px-6 pb-16 min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min gap-6 w-full max-w-2xl">
            <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-10 rounded-xl outline outline-slate-700">
              <header className="text-4xl text-slate-400 outline-none">{post?.title}</header>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post?.rank1}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post?.rank2}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post?.rank3}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post?.rank4}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post?.rank5}</li>
            </ul>
            <header className="w-40 pt-2 text-lg text-slate-400">{views} views</header>
            <div>
              <AddLike likes={post?.likes} postid={params.id} />
            </div>
            <div className="grid grid-cols-1 grid-flow-row auto-rows-auto">
              <p className="w-full max-w-2xl outline rounded-md p-5 row-start-2 break-words empty:hidden peer">{post?.explain}</p>
              <header className="text-3xl justify-self-left pb-6 row-start-1 peer-empty:hidden">Explanation</header>
            </div>
          </div>
        </div>

        <Footer />
      </>
    )
  }
  else {
    return (
      <>
        <Header />
        <div className="flex justify-center pt-96">
          <header>This post does not exist or has been deleted.</header>
        </div>

      </>

    )
  }
}