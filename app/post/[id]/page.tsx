import { AddLike } from "@/components/AddLike";
import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { runReport } from "@/components/serverActions/pageview";
import { Delete } from "@/components/Delete";
import Link from "next/link";
import { AddComment } from "@/components/AddComment";
import { ListCarousel } from "@/components/ListCarousel";
import Image from 'next/image'
import profilepic from '../../../pfp.png'
import { Metadata } from "next";
import Head from 'next/head';
import { ShareButton } from "@/components/ShareButton";
import { VideoDisplay } from "@/components/VideoDisplay";
import { LoadSinglePost } from "@/components/serverActions/loadposts";
import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-helpers";

/*This may be the new most complex component since there's so many components now attached to it, just look above this line. Anyways this is a top to bottom explanation of what's going
on. The first function is for metadata, which sets a title, description based on the number of ranks, and its canonical url. Then an opengraph image preview is generated for different 
sites like Facebook and Twitter using the metadata variables. The OG url also creates an image preview of the post. For a description of how things worked previous to adding sharing
its below this function. The main thing that was added is the sharebutton component, which is provided with all post data so that when the post is shared on different social media sites
it provides a link preview as well. 
*/

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);

  if (post === null) {
    return {
      title: "Post not found",
      description: "This post does not exist or has been deleted.",
    };
  }

  const ranks = [post.rank1, post.rank2, post.rank3].filter(Boolean).slice(0, 3);
  const rankDescription = `Top ${ranks.length}: ${ranks.join(', ')}`;
  const description = post.description ? post.description.slice(0, 155) + (post.description.length > 155 ? '...' : '') : rankDescription;
  const canonicalUrl = `https://ranktop.net/post/${params.id}`;

  const ogImageUrl = `https://ranktop.net/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description || '')}&ranks=${encodeURIComponent(ranks.join(','))}`;

  return {
    title: post.title,
    description: description,

    openGraph: {
      title: post.title,
      description: description,
      url: canonicalUrl,
      siteName: 'RankTop',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.metadata?.date.toISOString(),
      authors: post.username ? [post.username] : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: [ogImageUrl],
      creator: post.username ? `@${post.username}` : undefined,
      site: '@ranktop',
    },

    alternates: {
      canonical: canonicalUrl,
    },
  };
}

//This is a dynamic page that displays posts when users click on them from homepage, unverified, or all, or after they submit a post. 
//It recieves the post id as a parameter and fetches the post using the findUnique Prisma API. Then it creates a Google Analytics report on the current
//post id to fetch the total number of pageviews this page has(temp solution, better to populate database with views instead). It calls its own "PostHeader"
//(slightly different than other headers, needed to be another component), and AddLikes to manage the like state and the like counter. It will also conditionally
//render "Description" if there is a description or not. 
//Posts with images are now a part of this page, with a separate format. The post is rendered using the ListCarousel component that cycles through each rank/image
//with the left/right chevron. The title is fixed to the top, outside the post outline. 

export default async function Post(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);
  const { signedin, username, userid } = await getSessionData();

  const liked = (await prisma.likes.findUnique({
    where: {
      userId_postId: {
        userId: userid,
        postId: params.id,
      },
    }
  })) != null;

  if (!post) {
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

  const yours = (post.username === username) || (username === "Cinnamon");
  const views = await runReport(`/post/${params.id}`);
  const editable = views < 10;

  if (post.metadata) {
    let date: string;
    const now = new Date();
    const diff = now.getTime() - post.metadata.date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
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

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.description || `Top ranking: ${post.rank1}`,
      "author": {
        "@type": "Person",
        "name": post.username || "Guest"
      },
      "datePublished": post.metadata.date.toISOString(),
      "dateModified": post.metadata.date.toISOString(),
      "publisher": {
        "@type": "Organization",
        "name": "RankTop",
        "logo": {
          "@type": "ImageObject",
          "url": `https://ranktop.net/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ranktop.net/post/${params.id}`
      },
      "image": post.metadata?.images
        ? `https://ranktop.net/api/og/post/${params.id}`
        : `https://ranktop.net/api/og/post/${params.id}`,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": post.metadata.likes
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": views
        }
      ]
    };

    return (
      <>
        <Head> <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        </Head>
        <Header />

        <div className="flex justify-center px-6 pb-10 min-h-[calc(100vh-64px)] pt-[141px] lg:pt-[94px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
            <div className="max-w-2xl w-full flex justify-between items-end">
              <header className="text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">{post.title}</header>
              <div className="flex space-x-3 pb-4">
                <ShareButton postId={params.id} postTitle={post.title} postDescription={post.description} postRanks={[post.rank1, post.rank2, post.rank3, post.rank4, post.rank5]} videoUrl={post.metadata.videoUrl} />
                {yours && !editable &&
                  <Delete id={params.id} />
                }
                {yours && editable &&
                  <>
                    <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400 h-10 whitespace-nowrap">
                      <Link href={`/edit/${params.id}`}>Edit</Link>
                    </button>
                    <Delete id={params.id} />
                  </>
                }
              </div>
            </div>
            <div className="w-full">
              {post.metadata.videoUrl ? (
                <VideoDisplay videoUrl={post.metadata.videoUrl} title={post.title} ranks={[post.rank1, post.rank2, post.rank3, post.rank4, post.rank5]} />
              ) : post.metadata.images ? (
                <div className="pt-8 pb-8 rounded-xl outline outline-slate-700 bg-slate-900/20">
                  <ListCarousel ranks={[post.rank1, post.rank2, post.rank3, post.rank4, post.rank5]} postid={params.id} firstimage={true} />
                </div>
              ) : (
                <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside list-decimal p-4 sm:p-6 rounded-xl outline outline-slate-700 bg-slate-900/20">
                  <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank1}</li>
                  <li className="text-xl text-slate-400 outline-none p-2 w-11/12">{post.rank2}</li>
                  <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank3}</li>
                  <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank4}</li>
                  <li className="text-xl text-slate-400 outline-none p-2 w-11/12 empty:hidden">{post.rank5}</li>
                </ul>
              )}
            </div>
            <div className="flex justify-between py-4">
              <div className="flex flex-col space-y-3">
                {post.username &&
                  <Link href={`/user/${post.username}`} className="items-center flex flex-row space-x-1 w-fit">
                    <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                    <header className="text-slate-400">{post.username}</header>
                  </Link>
                }
                {post.username === null &&
                  <div className="items-center flex flex-row space-x-1">
                    <Image src={profilepic} alt={"pfp"} width={30} height={30} />
                    <header className="text-slate-400">Guest</header>
                  </div>
                }
                <div className="flex flex-row space-x-4">
                  <div className="flex space-x-1 items-center">
                    <AddLike postid={params.id} likes={post.metadata.likes} userliked={liked} userid={userid} />
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
            <AddComment userid={userid} postid={params.id} username={username} />
          </div>
        </div>
        <Footer />
      </>
    )
  }
}