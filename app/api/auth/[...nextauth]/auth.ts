// auth.ts
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import type { NextAuthOptions } from 'next-auth'
import argon2 from 'argon2'

function CustomPrismaAdapter(p: typeof prisma) {
  const adapter = PrismaAdapter(p);
  
  return {
    ...adapter,
    async createUser(data: any) {
      // If username is missing (OAuth user), generate one
      if (!data.username) {
        // Generate temporary ID to create username
        const tempId = Math.random().toString(36).substring(2, 9);
        data.username = `user_${tempId}`;
      }
      
      // @ts-ignore - Call original createUser
      return adapter.createUser!(data);
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;
        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email!,
          username: user.username,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }

      // Handle manual session updates (like from UsernameForm)
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true }
        });
        
        if (dbUser?.username) {
          token.username = dbUser.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  }
}