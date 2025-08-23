import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  users,
  accounts,
  sessions,
  verificationTokens
} from "./schema";
import { eq } from "drizzle-orm";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
 
  session: { strategy: "jwt" },
 
  callbacks: {
    async session({ session, token }) {
      console.log("🔄 Session callback - token:", token);
      console.log("🔄 Session callback - session before:", session);

      if (session && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.image = token.image as string;
      }

      console.log("🔄 Session callback - session after:", session);
      return session;
    },
   
    async jwt({ token, trigger, session }) {
      console.log("🔧 JWT callback - trigger:", trigger);
      console.log("🔧 JWT callback - token before:", token);

      // Handle session updates
      if (trigger === "update") {
        console.log("🔄 JWT Update triggered - fetching fresh data");
        
        if (!token.sub) return token;
        
        try {
          const freshUser = await db.query.users.findFirst({
            where: eq(users.id, token.sub),
          });
          
          console.log("🔄 Fresh user data:", freshUser);
          
          if (freshUser) {
            token.name = freshUser.name;
            token.image = freshUser.image;
            token.email = freshUser.email;
            token.role = freshUser.role;
            token.isTwoFactorEnabled = freshUser.twoFactorEnabled;
            
            console.log("🔄 Updated token with fresh data:", token);
          }
        } catch (error) {
          console.error("❌ Error fetching fresh user data:", error);
        }
        
        return token;
      }

      // Initial token setup
      if (!token.sub) return token;
     
      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });
       
        if (!existingUser) return token;
       
        const existingAccount = await db.query.accounts.findFirst({
          where: eq(accounts.userId, existingUser.id),
        });
       
        token.isOAuth = !!existingAccount;
        token.name = existingUser.name;
        token.email = existingUser.email;
        token.role = existingUser.role;
        token.isTwoFactorEnabled = existingUser.twoFactorEnabled;
        token.image = existingUser.image;
       
        console.log("🔧 JWT callback - token after:", token);
        return token;
      } catch (error) {
        console.error("💥 JWT callback error:", error);
        return token;
      }
    },
  },
 
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
 
  debug: process.env.NODE_ENV === "development",
});