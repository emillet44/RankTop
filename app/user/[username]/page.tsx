import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { LoadUserPosts } from "@/components/serverActions/loadposts";
import { SignState } from "@/components/serverActions/signinstate";
import ProfilePostList from "@/components/ProfilePostList";


export default async function Profile({ params } : { params: {username: string} }) {

  const states = await SignState();
  const posts = await LoadUserPosts(0, states[2]);
  
  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] pt-[148px] lg:pt-[100px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center justify-center flex-col">
        <ProfilePostList starter={posts} userid={states[2]} username={params.username} />
      </div>
      <Footer />
    </>
  )
}