'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

let states: any[] = [false, false, ""];

//This server action uses the states array to store pertinent data about the user. States[0] stores the sign in state used in many parts of the site, primarily
//to display either "Sign In" or "Log Out" on the headers. States[1] stores whether the user has a username or not, to display either "Add Username" or "states[2]"
//on the header. States[2] stores the users username if they have one.
export async function SignState() {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (email !== null && email !== undefined) {
    states[0] = true;

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (user?.username !== null) {
      states[1] = true;
      states[2] = user?.username;
    }
    else {
      states[1] = false;
    }
  }
  else {
    states[0] = false;
  }
  return states;
}