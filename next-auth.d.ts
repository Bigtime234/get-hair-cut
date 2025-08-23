import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    isOAuth: boolean
    image: string
  }
  
  interface Session {
    user: User & DefaultSession["user"]
  }
}

export type ExtendUser = DefaultSession["user"] & {
  id: string
  role: string
  isOAuth: boolean
  image: string
}