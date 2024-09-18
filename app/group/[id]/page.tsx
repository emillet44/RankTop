import { Footer } from "@/components/Footer";
import { JoinGroup } from "@/components/JoinGroupButton";
import { ListCarousel } from "@/components/ListCarousel";
import { Header } from "@/components/headers/Header";
import { SignState } from "@/components/serverActions/signinstate";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function Group({ params }: { params: { id: string } }) {
  const group = await prisma.groups.findUnique({
    where: {
      id: params.id
    },
    include: {
      members: {
        select: {
          id: true
        }
      }
    }
  });

  if (group && !group.private) {
    const states: any[] = await SignState();
    const gposts = await prisma.posts.findMany({
      where: {
        groupId: params.id
      },
      include: {
        metadata: true
      }
    });
    const user = await prisma.user.findUnique({
      where: {
        id: states[2]
      },
      select: {
        memberGroups: {
          where: {
            id: group?.id
          },
          select: {
            id: true
          }
        },
        adminGroups: {
          where: {
            id: group?.id
          },
          select: {
            id: true
          }
        }
      }
    });

    const useringroup = !!user && (user.memberGroups.length > 0 || user.adminGroups.length > 0);

    return (
      <>
        <Header />
        <div className="flex justify-center pt-[148px] md:pt-[100px] pb-10 sm:px-6 min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
          <div className="max-w-4xl w-full flex flex-col items-center">
            {group.bannerimg &&
              <div className=" h-96 mb-4 w-full relative rounded-md">
                <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}banner.png`} alt="Profile picture" fill className="absolute inset-0 rounded-md object-cover object-center" />
              </div>
            }
            <div className="w-full flex justify-between items-start border-b pb-2">
              <div className="flex flex-row">
                <div className="w-16 h-16 bg-slate-400 mr-2 rounded-full relative flex items-center justify-center">
                  {group.profileimg &&
                    <Image src={`https://storage.googleapis.com/ranktop-i/${group.id}profile.png`} alt="Profile picture" fill className="absolute inset-0 rounded-full object-cover object-center" />
                  }
                  {!group.profileimg &&
                    <label>Profile</label>
                  }
                </div>
                <div className="flex flex-col">
                  <h1 className="text-4xl text-offwhite">{group.name}</h1>
                  <h2 className="text-sm text-slate-400 mt-1">Public • {group.population} {group.population === 1 ? "member" : "members"}</h2>
                </div>
              </div>
              {!useringroup &&
                <JoinGroup userid={states[2]} groupid={group.id} />
              }
            </div>
            <div className="grid grid-cols-1 w-full max-w-2xl justify-items-center auto-rows-min">
              {gposts.map((list: any, index: number) => (
                <Link href={`/post/${list.id}`} className="w-full" key={list.id}>
                  {list.metadata?.images &&
                    <div className="py-8 sm:border-x border-b border-slate-700">
                      <header className="pl-8 text-4xl line-clamp-2 text-slate-400 font-semibold">{list.title}</header>
                      <ListCarousel ranks={[list.rank1, list.rank2, list.rank3, list.rank4, list.rank5]} postid={list.id} firstimage={index === 0} />
                    </div>
                  }
                  {!list.metadata?.images &&
                    <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 list-inside list-decimal p-8 sm:border-x border-b border-slate-700">
                      <header className="text-4xl line-clamp-2 text-slate-400 font-semibold">{list.title}</header>
                      <li className="truncate text-xl text-slate-400">{list.rank1}</li>
                      <li className="truncate text-xl text-slate-400">{list.rank2}</li>
                      <li className="empty:hidden truncate text-xl text-slate-400">{list.rank3}</li>
                      <li className="empty:hidden truncate text-xl text-slate-400">{list.rank4}</li>
                      <li className="empty:hidden truncate text-xl text-slate-400">{list.rank5}</li>
                    </ul>
                  }
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }
  else {
    return notFound();
  }
}