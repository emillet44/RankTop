//Function for cron job to call to automate Algolia indexing
import { AlgoliaUpdate } from "@/components/search/AlgoliaUpdate";

export async function GET(request: any) {
  try {
    await AlgoliaUpdate();
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error}), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}