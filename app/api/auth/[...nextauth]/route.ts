import NextAuth from "next-auth"
import { authOptions } from "./auth";

//This function calls NextAuth APIs, specifically the Prisma database adapter to read or create user profiles, and the Google Provider
//to allow users to sign in with Google

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }