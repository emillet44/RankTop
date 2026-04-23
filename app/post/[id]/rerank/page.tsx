import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadSinglePost } from "@/components/serverActions/loadposts";
import { fetchImageMetadata } from "@/components/serverActions/findimage";
import { notFound } from "next/navigation";
import { RerankForm } from "@/components/RerankForm";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default async function RerankPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);

  if (!post || post.metadata?.videoUrl || post.reRankType === "NONE") {
    return notFound();
  }

  // Pre-fetch images on the server for better performance
  const { imageUrls } = await fetchImageMetadata(params.id);

  const isFull = post.reRankType === "FULL";

  return (
    <>
      <Header />
      <div className="flex justify-center px-6 pb-20 min-h-[calc(100vh-52px)] pt-[141px] lg:pt-[94px]">
        <div className="w-full max-w-2xl">
          <header className="mb-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <Link 
              href={`/post/${params.id}`} 
              className="group flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-[15px] font-bold  tracking-[0.1em] mb-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Back to post
            </Link>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">{post.title}</h1>
            <p className="text-slate-400 max-w-xl leading-relaxed text-sm">
              {isFull 
                ? "Drag to reorder, or click to edit text and images for this ranking." 
                : "Drag and drop items below to reorder them based on your preference."
              }
            </p>
          </header>

          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] px-4 pb-8 sm:px-8 backdrop-blur-sm shadow-2xl">
            <RerankForm post={post} id={params.id} initialImages={imageUrls} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
