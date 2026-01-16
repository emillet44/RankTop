'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"

/**
 * Get current user session data
 * Returns: { signedin, username, userid, session }
 */
export async function getSessionData() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { signedin: false, username: "", userid: "", session: null };
  }

  return {
    signedin: true,
    username: session.user.username || "",
    userid: session.user.id,
    session
  };
}