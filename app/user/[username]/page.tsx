import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadUserPosts } from "@/components/serverActions/loadposts";
import ProfilePostList from "@/components/ProfilePostList";
import { prisma } from "@/lib/prisma";
import { SignState } from "@/components/serverActions/signinstate";
import profilepic from "../../../pfp.png"
import Image from 'next/image';
import { AddFollow } from "@/components/AddFollow";


export default async function Profile({ params }: { params: { username: string } }) {

  const profileid = await prisma.user.findUnique({
    where: {
      username: params.username
    },
    select: {
      id: true,
      followerCount: true,
      followingCount: true
    }
  });

  if (profileid != null) {

    const posts = await LoadUserPosts(0, profileid.id);
    const states = await SignState();
    const following = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: states[2],
          followingId: profileid.id,
        },
      }
    }) != null;
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-64px)] pt-[148px] lg:pt-[100px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center flex-col">
          <div className="max-w-7xl w-[370px] lg:w-[840px] xl:w-full flex justify-between items-start border-b border-white pb-2">
            <div className="flex flex-row items-center">
              <div className="w-16 h-16 mr-2 rounded-full relative flex">
                <Image src={profilepic} alt="pfp" className="flex-shrink-0 object-fill" />
              </div>
              <AddFollow following={following} profileid={profileid.id} userid={states[2]} username={params.username} followerCount={profileid.followerCount} followingCount={profileid.followingCount} />
            </div>
          </div>
          <ProfilePostList starter={posts} profileid={profileid.id} />
        </div>
        <Footer />
      </>
    )
  }
  else {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-64px)] pt-[148px] lg:pt-[100px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center justify-center flex-col">
          <header className="text-offwhite">Profile not found!</header>
        </div>
        <Footer />
      </>
    )
  }
}