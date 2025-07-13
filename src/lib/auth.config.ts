import { type DefaultSession } from "next-auth";

// By declaring this module, we are extending the original NextAuth types.
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
    } & DefaultSession["user"]; // ...and the default properties (name, email, image)
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's id */
    sub: string;
  }
}