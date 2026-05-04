'use server'

import { prisma } from "@/lib/prisma"
import { getSessionData } from "@/lib/auth-helpers"
import { revalidatePath } from 'next/cache'

export async function saveReRanking(formData: FormData, id: string) {
  const { userid } = await getSessionData();
  const data = Object.fromEntries(formData);
  const rankMap = JSON.parse(data['rankMap'] as string || '[]') as number[];

  // Note: This action expects metadata only. Images are uploaded directly 
  // from the client to GCS to bypass the 1MB server action limit.

  try {
    let reranking;
    let isNewRerank = false;

    if (userid) {
      // 1. Check if user already has a reranking for this post
      const existingRerank = await prisma.reRankings.findUnique({
        where: {
          userId_postId: {
            userId: userid,
            postId: id
          }
        }
      });

      if (!existingRerank) isNewRerank = true;

      // 2. Handle the ReRankings record using upsert for authenticated users
      reranking = await prisma.reRankings.upsert({
        where: {
          userId_postId: {
            userId: userid,
            postId: id
          }
        },
        update: {
          rankMap: rankMap,
          createdAt: new Date() // Reset creation time on update
        },
        create: {
          postId: id,
          userId: userid,
          items: [], // placeholder
          normalizedItems: [], // placeholder
          rankMap: rankMap
        }
      });
    } else {
      // 3. For anonymous users, always create a new record
      isNewRerank = true;
      reranking = await prisma.reRankings.create({
        data: {
          postId: id,
          userId: null,
          items: [], // placeholder
          normalizedItems: [], // placeholder
          rankMap: rankMap
        }
      });
    }

    // 4. Increment rerankCount in Post_Metadata ONLY if it's a new re-ranking
    if (isNewRerank) {
      await prisma.post_Metadata.update({
        where: { postId: id },
        data: {
          rerankCount: { increment: 1 }
        }
      });
    }

    const items = [];
    for (let i = 1; i <= 10; i++) {
      const text = data[`r${i}`] as string;
      const note = data[`r${i}_note`] as string;
      const existingUrl = data[`imgUrl${i}`] as string;
      const hasNewImage = data[`hasNewImg${i}`] === 'true';

      if (text) {
        let imageUrl = null;
        if (hasNewImage) {
          imageUrl = `https://storage.googleapis.com/ranktop-i/${reranking.id}${i}.png`;
        } else if (existingUrl && !existingUrl.startsWith('blob:')) {
          imageUrl = existingUrl;
        }

        items.push({
          text,
          note: note || null,
          imageUrl
        });
      }
    }

    // 4. Update the record with final items and normalizedItems
    await prisma.reRankings.update({
      where: { id: reranking.id },
      data: {
        items: items as any,
        normalizedItems: items as any
      }
    });

    revalidatePath(`/post/${id}`);
    revalidatePath(`/post/${id}/rerank`);
    
    return reranking.id;
  } catch (error) {
    console.error("Prisma Rerank Save Error:", error);
    throw new Error("Failed to save reranking in database");
  }
}
