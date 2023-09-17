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

  let author;

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (post?.authorId !== null) {
    author = await prisma.user.findUnique({
      where: { id: post?.authorId }
    })
  };

  const views = await runReport(`/post/${params.id}`);

  if (post !== null) {
    return (
      <>
        <Header />

        <div className="flex justify-center py-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
            <header className="text-lg pb-4 text-slate-400">Posted by: {author?.username || "Guest"}</header>
            <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 rounded-xl outline outline-slate-700">
              <header className="text-4xl capitalize text-slate-400 outline-none">{post.title}</header>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank1}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank2}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank3}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank4}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank5}</li>
            </ul>
            {post.explain !== null &&
              <div className="pt-6">
                <header className="text-3xl text-slate-400 justify-self-left pb-6 row-start-1">Explanation</header>
                <p className="w-full max-w-2xl outline outline-slate-700 rounded-md p-5 row-start-2 break-words text-slate-400">{post.explain}</p>
              </div>
            }
            <header className="w-40 pb-6 pt-8 text-lg text-slate-400">{views} views</header>
            <div>
              <AddLike likes={post?.likes} postid={params.id} />
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
        <div className="flex justify-center min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 pt-96">
          <header className="text-slate-400">This post does not exist or has been deleted.</header>
        </div>
        <Footer />
      </>

    )
  }
}