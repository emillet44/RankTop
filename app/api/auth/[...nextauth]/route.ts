import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import type { NextAuthOptions } from 'next-auth'

//This function calls NextAuth APIs, specifically the Prisma database adapter to read or create user profiles, and the Google Provider
//to allow users to sign in with Google
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
}


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }