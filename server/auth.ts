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
  // FIXED: Explicit table mapping for DrizzleAdapter
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
 
  session: { strategy: "jwt" },
 
  // REMOVED: Custom pages that were causing 404 errors
  // This will now use Auth.js default signin page
  // pages: {
  //   signIn: "/auth/signin",
  //   error: "/auth/error",
  // },
 
  callbacks: {
    async session({ session, token, trigger, newSession }) {
      if (session && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.image = token.image as string;
      }

      // If this is an update trigger, merge the new session data
      if (trigger === "update" && newSession) {
        // Update the token with new values
        if (newSession.user?.name !== undefined) {
          token.name = newSession.user.name;
          session.user.name = newSession.user.name;
        }
        if (newSession.user?.image !== undefined) {
          token.image = newSession.user.image;
          session.user.image = newSession.user.image;
        }
      }
      
      return session;
    },
   
    async jwt({ token, trigger, session }) {
      if (!token.sub) return token;

      // If this is an update trigger, refresh from database and merge session data
      if (trigger === "update") {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.id, token.sub),
          });
          
          if (existingUser) {
            // Update token with fresh database values
            token.name = existingUser.name;
            token.email = existingUser.email;
            token.role = existingUser.role;
            token.isTwoFactorEnabled = existingUser.twoFactorEnabled;
            token.image = existingUser.image;
          }

          // Also merge any session data passed from update call
          if (session?.user?.name !== undefined) {
            token.name = session.user.name;
          }
          if (session?.user?.image !== undefined) {
            token.image = session.user.image;
          }
        } catch (error) {
          console.error("JWT update callback error:", error);
        }
        
        return token;
      }

      // For initial JWT creation or refresh (not update), load from database
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
       
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
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
 
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
});