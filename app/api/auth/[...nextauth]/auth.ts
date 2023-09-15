import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import type { NextAuthOptions } from 'next-auth'

//According to the maintainer of NextAuth this is required to avoid a build error with NextJS caused
//by the package itself. Eventually switching to authjs when it comes out will avoid this separation of files(this code should just
//be in route.ts)
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
  }