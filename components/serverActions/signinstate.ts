'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import { prisma } from "@/lib/prisma"

let states: any[] = [false, "", ""];

//This server action uses the states array to store pertinent data about the user. States[0] stores the sign in state used in many parts of the site, primarily
//to display either "Sign In" or "Log Out" on the headers. States[1] stores the username, empty for users without one. States[2] stores userid, which is used for comments.
export async function SignState() {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {
    states[0] = true;

    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    states[2] = user?.id;
    if (user?.username !== null) {
      states[1] = user?.username;
    }
  }
  else {
    states[0] = false;
  }
  return states;
}