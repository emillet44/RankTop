'use server'

const MAX_WEIGHT = 4;
const DUPLICATE_CAP = 3.0; // Aggressive cap: identical rankings behave like 3 high-weight ones at most

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Item {
  text: string;
  note?: string | null;
  imageUrl?: string | null;
}

interface ReRanking {
  items: Item[];
  rankMap: number[];
  likes: number;
  createdAt: Date;
}

interface Post {
  items: Item[];
  itemCount: number;
  reRankType: 'REORDER' | 'FULL' | 'NONE';
  images?: string[];
}

interface RankedItem {
  item: Item;
  finalScore: number;
}

/**
 * Represents a group of identical rankings treated as a single weighted entity.
 */
interface RerankCluster {
  items: Item[];
  rankMap: number[];
  effectiveWeight: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeIndividualWeight(likes: number): number {
  return Math.min(1 + Math.log(1 + likes), MAX_WEIGHT);
}

/**
 * Normalizes text to make signatures robust against minor formatting differences.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, '');    // Collapse all spaces
}

/**
 * Generates a canonical signature for a ranking based on the sequence of items.
 */
function getRerankSignature(rerank: ReRanking, postItems: Item[]): string {
  const parts: string[] = [];

  for (let i = 0; i < rerank.rankMap.length; i++) {
    const originalIndex = rerank.rankMap[i];
    if (originalIndex !== -1 && originalIndex < postItems.length) {
      // Use the canonical post item text if it exists
      parts.push(normalizeText(postItems[originalIndex].text));
    } else if (rerank.items[i]) {
      // Use the text provided in the rerank (new items in FULL mode)
      parts.push(normalizeText(rerank.items[i].text));
    }
  }

  return parts.join('|');
}

/**
 * Groups identical rankings and applies the soft cap formula.
 */
function clusterRerankings(rerankings: ReRanking[], postItems: Item[]): RerankCluster[] {
  const signatureMap = new Map<string, { totalWeight: number; rep: ReRanking }>();

  for (const rerank of rerankings) {
    const sig = getRerankSignature(rerank, postItems);
    const weight = computeIndividualWeight(rerank.likes);

    const existing = signatureMap.get(sig);
    if (existing) {
      existing.totalWeight += weight;
    } else {
      signatureMap.set(sig, { totalWeight: weight, rep: rerank });
    }
  }

  const clusters: RerankCluster[] = [];

  // Fixed: Use Array.from() to avoid iteration flags issues in some TS environments
  const groups = Array.from(signatureMap.values());

  for (const { totalWeight, rep } of groups) {
    // Option A: Effective Weight = Cap * (1 - e^(-TotalWeight / Cap))
    // This allows weights to grow normally at first, then aggressively plateau.
    const effectiveWeight = DUPLICATE_CAP * (1 - Math.exp(-totalWeight / DUPLICATE_CAP));

    clusters.push({
      items: rep.items,
      rankMap: rep.rankMap,
      effectiveWeight,
    });
  }

  return clusters;
}

// ─── REORDER MODE ─────────────────────────────────────────────────────────────

function calculateReorderMode(
  postItems: Item[],
  clusters: RerankCluster[],
  originalImages?: string[]
): RankedItem[] {
  const N = postItems.length;

  // itemIndex -> { totalScore, totalWeight }
  const scoreMap = new Map<number, { totalScore: number; totalWeight: number }>();

  for (let idx = 0; idx < N; idx++) {
    scoreMap.set(idx, { totalScore: 0, totalWeight: 0 });
  }

  for (const cluster of clusters) {
    const weight = cluster.effectiveWeight;
    const rankMap = cluster.rankMap;

    for (let position = 0; position < rankMap.length; position++) {
      const originalIndex = rankMap[position];
      if (originalIndex < 0 || originalIndex >= N) continue;

      const score = N - position;
      const entry = scoreMap.get(originalIndex)!;
      entry.totalScore += score * weight;
      entry.totalWeight += weight;
    }
  }

  return postItems
    .map((item, idx) => {
      const entry = scoreMap.get(idx)!;
      const finalScore = entry.totalWeight > 0
        ? entry.totalScore / entry.totalWeight
        : 0;
      
      const itemWithImage = { 
        ...item, 
        imageUrl: item.imageUrl || originalImages?.[idx] || null 
      };

      return { item: itemWithImage, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

// ─── FULL MODE ────────────────────────────────────────────────────────────────

function calculateFullMode(
  postItems: Item[],
  clusters: RerankCluster[],
  originalImages?: string[]
): RankedItem[] {
  let totalWeightAcrossAllClusters = 0;

  // Build a set of normalized keys for original post items
  const originalNormalizedKeys = new Set<string>();
  for (const item of postItems) {
    originalNormalizedKeys.add(normalizeText(item.text));
  }

  // normalizedKey -> { totalScore, weightedAppearances, isNew, item }
  const scoreMap = new Map<string, {
    totalScore: number;
    weightedAppearances: number;
    isNew: boolean;
    item: Item;
  }>();

  // Pre-seed all original items
  for (let i = 0; i < postItems.length; i++) {
    const item = postItems[i];
    const key = normalizeText(item.text);
    scoreMap.set(key, {
      totalScore: 0,
      weightedAppearances: 0,
      isNew: false,
      item: { ...item, imageUrl: item.imageUrl || originalImages?.[i] || null },
    });
  }

  for (const cluster of clusters) {
    const weight = cluster.effectiveWeight;
    totalWeightAcrossAllClusters += weight;
    const N = cluster.items.length;

    for (let position = 0; position < cluster.rankMap.length; position++) {
      const originalIndex = cluster.rankMap[position];
      const score = N - position;

      let key: string;
      let item: Item;
      let isNew: boolean;

      if (originalIndex !== -1) {
        if (originalIndex < 0 || originalIndex >= postItems.length) continue;
        const originalItem = postItems[originalIndex];
        item = { 
          ...originalItem, 
          imageUrl: originalItem.imageUrl || originalImages?.[originalIndex] || null 
        };
        key = normalizeText(item.text);
        isNew = false;
      } else {
        item = cluster.items[position];
        key = normalizeText(item.text);
        isNew = !originalNormalizedKeys.has(key);
      }

      if (!scoreMap.has(key)) {
        scoreMap.set(key, {
          totalScore: 0,
          weightedAppearances: 0,
          isNew,
          item,
        });
      }

      const entry = scoreMap.get(key)!;
      entry.totalScore += score * weight;
      entry.weightedAppearances += weight;
    }
  }

  // Traction threshold (now based on nerfed weights)
  const threshold = Math.max(1.5, 0.1 * totalWeightAcrossAllClusters);

  const results: RankedItem[] = [];

  for (const entry of Array.from(scoreMap.values())) {
    if (entry.isNew && entry.weightedAppearances < threshold) continue;

    let finalScore: number;
    if (!entry.isNew) {
      finalScore = totalWeightAcrossAllClusters > 0
        ? entry.totalScore / totalWeightAcrossAllClusters
        : 0;
    } else {
      finalScore = entry.weightedAppearances > 0
        ? entry.totalScore / entry.weightedAppearances
        : 0;
    }

    results.push({ item: entry.item, finalScore });
  }

  return results.sort((a, b) => b.finalScore - a.finalScore);
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export async function calculateRerank(
  rerankings: ReRanking[],
  post: Post
): Promise<RankedItem[] | null> {
  if (!rerankings || rerankings.length === 0) return null;
  if (!post?.items || !post.reRankType) return null;

  const postItems: Item[] = Array.isArray(post.items) ? post.items : [];

  // Step 1: Cluster identical rankings and apply spam-protection weights
  const clusters = clusterRerankings(rerankings, postItems);

  // Step 2: Calculate based on clusters
  switch (post.reRankType) {
    case 'REORDER':
      return calculateReorderMode(postItems, clusters, post.images);
    case 'FULL':
      return calculateFullMode(postItems, clusters, post.images);
    default:
      return null;
  }
}