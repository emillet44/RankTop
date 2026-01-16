import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { LoadUserPosts } from "@/components/serverActions/loadposts";
import ProfilePostList from "@/components/ProfilePostList";
import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-helpers";
import profilepic from "../../../pfp.png";
import Image from 'next/image';
import { AddFollow } from "@/components/AddFollow";
import { notFound, redirect } from "next/navigation";

export default async function Profile(props: { params: Promise<{ username: string }> }) {
  const { username } = await props.params;
  const session = await getSessionData();
  const currentUserId = session?.userid;

  // Case-insensitive lookup
  const profileUser = await prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      username: true, // Get the actual capitalized username
      followerCount: true,
      followingCount: true,
      followers: currentUserId ? {
        where: { followerId: currentUserId },
        select: { followerId: true }
      } : false
    }
  });

  // 1. Handle user not found
  if (!profileUser) {
    notFound();
  }

  // 2. Redirect to lowercase canonical URL if needed
  const lowercaseUsername = profileUser.username.toLowerCase();
  if (username !== lowercaseUsername) {
    redirect(`/user/${lowercaseUsername}`);
  }

  const posts = await LoadUserPosts(0, profileUser.id);
  const isFollowing = Array.isArray(profileUser.followers) && profileUser.followers.length > 0;
  const isOwnProfile = currentUserId === profileUser.id;

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] pt-[148px] lg:pt-[100px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center flex-col">
        <div className="max-w-7xl w-[370px] lg:w-[840px] xl:w-full flex justify-between items-start border-b border-white pb-4">
          <div className="flex flex-row items-center w-full">
            <div className="w-16 h-16 mr-4 rounded-full relative overflow-hidden border border-gray-800">
              <Image src={profilepic} alt="pfp" className="object-cover" fill />
            </div>
            
            <AddFollow 
              following={isFollowing} 
              profileid={profileUser.id} 
              userid={currentUserId} 
              username={profileUser.username} // Use actual capitalized username
              followerCount={profileUser.followerCount} 
              followingCount={profileUser.followingCount}
              isOwnProfile={isOwnProfile} 
            />
          </div>
        </div>
        <ProfilePostList starter={posts} profileid={profileUser.id} />
      </div>
      <Footer />
    </>
  );
}