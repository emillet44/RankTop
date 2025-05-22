//Function for cron job to call to automate views indexing
import { UpdatePostViews } from "@/components/serverActions/batchviews";

export async function GET(request: any) {
  try {
    await UpdatePostViews();
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