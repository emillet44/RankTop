import { AddLike } from "@/components/AddLike";
import { Header } from "@/components/PostHeader";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ReactGA from "react-ga4";

export default async function Post({ params }: { params: { id: string } }) {

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });
  
  if (post !== null) {

    ReactGA.initialize('G-JGMST5F7CL');
    ReactGA.send({hitType: "pageview", page: `/post/${params.id}`});

    return (
      <>
        <Header />

        <div className="flex justify-center pt-12 px-6 pb-16 min-h-[calc(100vh-116px)]">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min gap-6 w-full max-w-2xl">
            <header className="text-3xl justify-self-left">Post</header>
            <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-10 rounded-xl outline">
              <header className="text-4xl outline-none">{post?.title}</header>
              <li className="text-xl outline-none p-2 w-11/12">{post?.rank1}</li>
              <li className="text-xl outline-none p-2 w-11/12">{post?.rank2}</li>
              <li className="text-xl outline-none p-2 w-11/12 empty:hidden">{post?.rank3}</li>
              <li className="text-xl outline-none p-2 w-11/12 empty:hidden">{post?.rank4}</li>
              <li className="text-xl outline-none p-2 w-11/12 empty:hidden">{post?.rank5}</li>
            </ul>
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