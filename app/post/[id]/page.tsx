import { AddLike } from "@/components/AddLike";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { runReport } from "@/components/serverActions/pageview";
import { SignState } from "@/components/serverActions/signinstate";
import Delete from "@/components/Delete";

//Title is set to post title for better SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (post !== null) {
    return {
      title: post.title
    }
  }
}

//This is a dynamic page that displays posts when users click on them from homepage, unverified, or all, or after they submit a post. 
//It recieves the post id as a parameter and fetches the post using the findUnique Prisma API. Then it creates a Google Analytics report on the current
//post id to fetch the total number of pageviews this page has(temp solution, better to populate database with views instead). It calls its own "PostHeader"
//(slightly different than other headers, needed to be another component), and AddLikes to manage the like state and the like counter. It will also conditionally
//render "Explanation" if there is an explanation or not.
export default async function Post({ params }: { params: { id: string } }) {

  let author;
  const states: any[] = await SignState();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (post?.authorId != null) {
      author = await prisma.user.findUnique({
      where: { id: post?.authorId }
    })
  };

  const yours = (author?.username == states[2]) || (states[2] == "Cinnamon");
  const editable = (0 < 10);

  //Uncomment this for views. Change 0 to views in HTML as well, just commented to not have to deal with
  //private key formatting again on laptop. const views = await runReport(`/post/${params.id}`);

  if (post !== null) {
    return (
      <>
        <Header />

        <div className="flex justify-center py-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min gap-4 w-full max-w-2xl h-4/5">
            {yours &&
              <header className="text-lg text-slate-400">Posted by: {author?.username || "Guest"}</header>
            }
            {!yours && !editable &&
              <div className="max-w-2xl w-full h-10 flex justify-end space-x-4">
                <Delete id={params.id} />
              </div>
            }
            {!yours && editable &&
              <div className="max-w-2xl w-full h-10 flex justify-end space-x-4">
                <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Edit Post</button>
                <Delete id={params.id} />
              </div>
            }
            <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 rounded-xl outline outline-slate-700">
              <header className="text-4xl capitalize text-slate-400 outline-none">{post.title}</header>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank1}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank2}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank3}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank4}</li>
              <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank5}</li>
            </ul>
            <div className="flex space-x-5">
              <div className="flex space-x-2">
                <AddLike likes={post?.likes} postid={params.id} />
              </div>
              <header className="text-2xl text-slate-400 pt-0.5">{0} views</header>
            </div>
            {post.explain !== null &&
              <div className="">
                <header className="text-3xl text-slate-400 justify-self-left pb-4 row-start-1">Description</header>
                <p className="w-full max-w-2xl outline outline-slate-700 rounded-md p-5 row-start-2 break-words text-slate-400">{post.explain}</p>
              </div>
            }
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