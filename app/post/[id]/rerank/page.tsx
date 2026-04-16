import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadSinglePost } from "@/components/serverActions/loadposts";
import { fetchImageMetadata } from "@/components/serverActions/findimage";
import { notFound } from "next/navigation";
import { RerankForm } from "@/components/RerankForm";

export default async function RerankPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);

  if (!post || post.metadata?.videoUrl) {
    return notFound();
  }

  // Pre-fetch images on the server for better performance
  const { imageUrls } = await fetchImageMetadata(params.id);

  return (
    <>
      <Header />
      <div className="flex justify-center px-6 pb-20 min-h-[calc(100vh-52px)] pt-[141px] lg:pt-[94px]">
        <div className="w-full max-w-2xl">
          <header className="mb-10 text-center lg:text-left">
            <h2 className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.3em] mb-2 drop-shadow-sm">Re-ranking System</h2>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">{post.title}</h1>
            <p className="mt-4 text-slate-400 max-w-xl leading-relaxed">
              Drag and drop items below to reorder them based on your preference.
            </p>
          </header>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-4 sm:p-8 backdrop-blur-sm">
            <RerankForm post={post} id={params.id} initialImages={imageUrls} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
