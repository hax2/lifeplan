// src/lib/auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// ----- CREDENTIALS PROVIDER -----
const credentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email:    { label: 'Email',    type: 'text',     placeholder: 'you@example.com' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    const { email, password } = credentials as { email: string; password: string };

    // 1 ) user exists?
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;

    // 2 ) password matches?
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    // 3 ) return minimal user object
    return { id: user.id, email: user.email, name: user.name };
  }
});

// ----- NEXTAUTH CONFIG -----
export const authConfig = {
  providers: [credentialsProvider],          // <-- was []
  pages:     { signIn: '/login' },
  callbacks: {
    // redirect logic stays as you wrote it
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn   = !!auth?.user;
      const isDashboard  = nextUrl.pathname.startsWith('/dashboard');

      if (isDashboard)   return isLoggedIn;
      if (isLoggedIn)    return Response.redirect(new URL('/dashboard', nextUrl));
      return true;
    }
  }
} satisfies NextAuthConfig;
