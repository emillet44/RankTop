import { Header } from "../../components/headers/Header";
import { Footer } from "@/components/Footer";
import { AlgoliaUpdate } from "@/components/search/AlgoliaUpdate";
import { LoadBatchCat } from "@/components/serverActions/loadposts";
import { Metadata } from 'next'
import PostList from "@/components/PostList";
import { UpdatePostViews } from "@/components/serverActions/batchviews";

//The description under the title when it shows up on Google Search
export const metadata: Metadata = {
  description: 'Create, share, and browse lists on anything and everything, ranked.',
  alternates: {
    canonical: '/home',
  },
}

//This is the homepage, very similar to /unverified and /all, but it displays verified posts by default. This is to prevent potentially NSFW posts from displaying
//as soon as the user opens the website. Currently posts have to be manually marked as verified. This page displays the tabs for post types, and on this page 
//specifically the "verified" tab is highlighted.
//Who even is that guy? Anyways this page is now the only page to view posts, and loads posts dynamically in batches of 3, however with more posts 20 seems more adequate. This
//page should also host the "Sort by" selector with options for views, likes, and categories in the future.
export default async function Home() {

  //AlgoliaUpdate();
  //UpdatePostViews();

  const starter = await LoadBatchCat(0, "None");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
      <Header />
      <main className="flex-grow pt-[52px]">
        <div className="max-w-2xl mx-auto sm:border-x border-white/10 min-h-[calc(100vh-104px)]">
          <div className="flex flex-col items-center">
            <PostList starter={starter} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}