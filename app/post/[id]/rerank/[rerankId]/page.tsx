import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import profilepic from '@/pfp.png';
import { getSessionData } from "@/lib/auth-helpers";
import { RerankCarousel } from "@/components/RerankCarousel";
import { fetchFirstImageMetadata } from "@/components/serverActions/findimage";
import { AddComment } from "@/components/AddComment";

interface Item {
  text: string;
  note?: string | null;
  imageUrl?: string | null;
}

export default async function ReRankingPage(props: { params: Promise<{ id: string, rerankId: string }> }) {
  const params = await props.params;
  const { userid, username } = await getSessionData();
  
  const rerank = await prisma.reRankings.findUnique({
    where: { id: params.rerankId },
    include: {
      post: {
        include: {
            metadata: true
        }
      },
      user: true,
    }
  });

  if (!rerank || rerank.postId !== params.id) {
    return notFound();
  }

  const items = (rerank.items as any as Item[]) || [];
  const hasImages = await fetchFirstImageMetadata(params.rerankId, true);

  let dateStr: string = "";
  const now = new Date();
  const diff = now.getTime() - rerank.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (diff / 1000 < 60) dateStr = "Seconds ago";
  else if (minutes < 60) dateStr = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  else if (hours < 24) dateStr = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  else dateStr = rerank.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Header />

      <div className="flex justify-center px-6 pb-10 min-h-[calc(100vh-52px)] pt-[141px] lg:pt-[94px]">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
          <div className="max-w-2xl w-full flex flex-col pb-2">
            <Link href={`/post/${rerank.postId}`} className="text-blue-500 hover:underline text-[10px] font-black  tracking-[0.2em] mb-2 pl-2">
              ← Back to {rerank.post.title}
            </Link>
            <div className="flex justify-between items-end">
                <header className="text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pl-2">
                    {rerank.post.title} <span className="text-blue-500 font-normal opacity-50">(Re-rank)</span>
                </header>
            </div>
          </div>

          <div className="w-full">
            {hasImages ? (
              <div className="pt-8 pb-8 rounded-xl outline outline-slate-700 bg-slate-900/20">
                <RerankCarousel items={items} rerankId={params.rerankId} firstimage={true} />
              </div>
            ) : (
              <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside list-decimal p-4 sm:p-6 rounded-xl outline outline-slate-700 bg-slate-900/20">
                {items.map((item, index) => (
                  <li key={index} className="text-xl text-slate-400 p-2 w-11/12">{item.text}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between py-4">
            <div className="flex flex-col space-y-3">
              <Link href={`/user/${rerank.user?.username}`} className="items-center flex flex-row space-x-1 w-fit">
                <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                <header className="text-slate-400">{rerank.user?.username || "Guest"}</header>
              </Link>
            </div>
            <label className="text-xl text-slate-400">{dateStr}</label>
          </div>

          {rerank.post.description && (
            <div className="pb-4">
              <header className="text-3xl text-slate-400 justify-self-left pb-4">Description</header>
              <p className="w-full max-w-2xl outline outline-slate-700 rounded-md p-5 break-words text-slate-400">{rerank.post.description}</p>
            </div>
          )}

          <AddComment userid={userid || ""} postid={params.id} username={username} />
        </div>
      </div>
      <Footer />
    </>
  );
}
