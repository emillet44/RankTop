import { AddLike } from "@/components/AddLike";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { runReport } from "@/components/serverActions/pageview";
import { SignState } from "@/components/serverActions/signinstate";
import { Delete } from "@/components/Delete";
import Link from "next/link";
import AddComment from "@/components/AddComment";
import { ListCarousel } from "@/components/ListCarousel";
import Image from 'next/image'
import profilepic from '../../../pfp.png'

//Title is set to post title for better SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await prisma.posts.findUnique({
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
//render "Description" if there is a description or not. 
//Posts with images are now a part of this page, with a separate format. The post is rendered using the ListCarousel component that cycles through each rank/image
//with the left/right chevron. The title is fixed to the top, outside the post outline. 
export default async function Post({ params }: { params: { id: string } }) {

  let author;
  const states: any[] = await SignState();
  const now = new Date();

  const post = await prisma.posts.findUnique({
    where: { id: params.id },
    include: { metadata: true },
  });
  if (post?.authorId != null) {
    author = await prisma.user.findUnique({
      where: { id: post?.authorId }
    })
  };

  const yours = (author?.username == states[1]) || (states[1] == "Cinnamon");
  const views = await runReport(`/post/${params.id}`);
  const editable = (views < 10);

  if (post !== null && post.metadata) {

    let date: string;
    const diff = now.getTime() - post.metadata.date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 1440000);
    if (diff / 1000 < 60) {
      date = "Seconds ago";
    }
    else if (minutes < 60) {
      date = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    else if (hours < 24) {
      date = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      date = post.metadata.date.toLocaleDateString('en-US', options);
    }

    return (
      <>
        <Header />

        <div className="flex justify-center px-6 pb-10 min-h-[calc(100vh-64px)] pt-[141px] lg:pt-[94px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
            <div className="max-w-2xl w-full flex justify-between items-end">
              <header className="text-2xl text-ellipsis overflow-hidden capitalize text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">{post.title}</header>
              <div className="flex space-x-4 pb-4">
                {!yours && !editable &&
                  <Delete id={params.id} />
                }
                {!yours && editable &&
                  <>
                    <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 h-10 whitespace-nowrap">
                      <Link href={`/edit/${params.id}`}>Edit</Link>
                    </button>
                    <Delete id={params.id} />
                  </>
                }
              </div>
            </div>
            {post.metadata?.images &&
              <div className="pt-8 pb-8 rounded-xl outline outline-slate-700">
                <ListCarousel ranks={[post.rank1, post.rank2, post.rank3, post.rank4, post.rank5]} postid={params.id} />
              </div>
            }
            {!post.metadata?.images &&
              <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside list-decimal p-4 sm:p-6 rounded-xl outline outline-slate-700">
                <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank1}</li>
                <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank2}</li>
                <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank3}</li>
                <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank4}</li>
                <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank5}</li>
              </ul>
            }
            <div className="flex justify-between py-4">
              <div className="flex flex-col space-y-3">
                <div className="items-center flex flex-row space-x-1">
                  <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                  <header className="text-slate-400">{author?.username || "Guest"}</header>
                </div>
                <div className="flex flex-row space-x-4">
                  <div className="flex space-x-1 items-center">
                    <AddLike likes={post?.metadata?.likes} postId={params.id} />
                  </div>
                  <header className="text-xl text-slate-400 pt-0.5">{views} views</header>
                </div>
              </div>
              <label className="text-xl text-slate-400">{date}</label>
            </div>
            {post.description !== null &&
              <div className="pb-4">
                <header className="text-3xl text-slate-400 justify-self-left pb-4 row-start-1">Description</header>
                <p className="w-full max-w-2xl outline outline-slate-700 rounded-md p-5 row-start-2 break-words text-slate-400">{post.description}</p>
              </div>
            }
            <AddComment />
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
        <div className="flex justify-center items-center py-10 px-6 min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
          <header className="text-slate-400">This post does not exist or has been deleted.</header>
        </div>
        <Footer />
      </>
    )
  }
}