import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";
import { runReport } from "@/components/serverActions/pageview";
import { Metadata } from "next";
import { LoadSinglePost } from "@/components/serverActions/loadposts";
import { fetchImageMetadata } from "@/components/serverActions/findimage";
import { prisma } from "@/lib/prisma";
import { getSessionData } from "@/lib/auth-helpers";
import { PostContent } from "@/components/PostContent";
import { calculateRerank } from "@/components/serverActions/calculatererank";

interface Item {
  text: string;
  note?: string | null;
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);

  if (!post) {
    return {
      title: "Post not found",
      description: "This post does not exist or has been deleted.",
    };
  }

  const items = (post.items as any as Item[]) || [];
  const ranks = items.map(i => i.text).filter(Boolean).slice(0, 3);
  const rankDescription = `Top ${ranks.length}: ${ranks.join(', ')}`;
  const description = post.description ? post.description.slice(0, 155) + (post.description.length > 155 ? '...' : '') : rankDescription;
  const canonicalUrl = `https://ranktop.net/post/${params.id}`;

  const ogImageUrl = post.metadata?.videoUrl 
    ? `https://storage.googleapis.com/ranktop-v-thumb/${params.id}.jpg`
    : `https://ranktop.net/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description || '')}&ranks=${encodeURIComponent(ranks.join(','))}`;

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: canonicalUrl,
      siteName: 'RankTop',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
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
    alternates: { canonical: canonicalUrl },
  };
}

export default async function Post(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await LoadSinglePost(params.id);
  const { signedin, username, userid } = await getSessionData();

  if (!post) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center py-10 px-6 min-h-[calc(100vh-52px)]">
          <header className="text-slate-400">This post does not exist or has been deleted.</header>
        </div>
        <Footer />
      </>
    )
  }

  const items = (post.items as any as Item[]) || [];
  const topRankName = items[0]?.text || "Ranking";

  const liked = (await prisma.likes.findUnique({
    where: { userId_postId: { userId: userid, postId: params.id } }
  })) != null;

  const yours = (post.username === username) || (username === "Cinnamon");
  const views = await runReport(`/post/${params.id}`);
  const editable = views < 10;
  const videoThumbnail = `https://storage.googleapis.com/ranktop-v-thumb/${params.id}.jpg`;
  const enableReRanking = post.reRankType !== "NONE";

  const { imageUrls } = enableReRanking ? await fetchImageMetadata(params.id) : { imageUrls: [] };

  const existingUserRerank = userid ? await prisma.reRankings.findFirst({
    where: { postId: params.id, userId: userid }
  }) : null;

  let enhancedExistingRerank: any = null;
  if (existingUserRerank) {
    const isLiked = userid ? await prisma.reRanking_Likes.findUnique({
      where: { userId_rerankingId: { userId: userid, rerankingId: existingUserRerank.id } }
    }) : null;
    enhancedExistingRerank = { ...existingUserRerank, userliked: !!isLiked };
  }

  const rerankings = await prisma.reRankings.findMany({
    where: { postId: params.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const userRerankLikes = userid ? await prisma.reRanking_Likes.findMany({
    where: { 
      userId: userid,
      rerankingId: { in: rerankings.map(r => r.id) }
    },
    select: { rerankingId: true }
  }) : [];

  const likedRerankingIds = new Set(userRerankLikes.map(l => l.rerankingId));

  const rerankingsWithLikes = rerankings.map(r => ({
    ...r,
    userliked: likedRerankingIds.has(r.id)
  }));

  // Compute community consensus server-side (null if no rerankings or reranking disabled)
  const consensusItems = enableReRanking && rerankings.length > 0
    ? await calculateRerank(
        rerankings.map(r => ({
          items: r.items as unknown as Item[],
          rankMap: r.rankMap,
          likes: r.likes,
          createdAt: r.createdAt
        })),
        {
          items: post.items as unknown as Item[],
          itemCount: post.itemCount,
          reRankType: post.reRankType as 'REORDER' | 'FULL' | 'NONE',
          images: imageUrls
        }
      )
    : null;

  let dateStr: string = "";
  if (post.metadata) {
    const now = new Date();
    const diff = now.getTime() - post.metadata.date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (diff / 1000 < 60) dateStr = "Seconds ago";
    else if (minutes < 60) dateStr = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    else if (hours < 24) dateStr = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    else dateStr = post.metadata.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const structuredData = post.metadata?.videoUrl ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": post.title,
    "description": post.description || `Top ranking: ${topRankName}`,
    "thumbnailUrl": videoThumbnail,
    "contentUrl": post.metadata.videoUrl,
    "uploadDate": post.metadata.date.toISOString(),
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": views
    }
  } : {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description || `Top ranking: ${topRankName}`,
    "author": { "@type": "Person", "name": post.username || "Guest" },
    "datePublished": post.metadata?.date.toISOString(),
    "image": `https://ranktop.net/api/og/post/${params.id}`,
    "publisher": {
        "@type": "Organization",
        "name": "RankTop",
        "logo": { "@type": "ImageObject", "url": "https://ranktop.net/logo.png" }
    }
  };

  return (
    <>
      <Header />
      <PostContent 
        post={post}
        id={params.id}
        signedin={signedin}
        username={username}
        userid={userid}
        liked={liked}
        views={views}
        yours={yours}
        editable={editable}
        enableReRanking={enableReRanking}
        imageUrls={imageUrls}
        existingUserRerank={enhancedExistingRerank}
        rerankingsWithLikes={rerankingsWithLikes}
        consensusItems={consensusItems}
        dateStr={dateStr}
        structuredData={structuredData}
      />
      <Footer />
    </>
  );
}