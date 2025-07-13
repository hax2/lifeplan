import NextAuth from 'next-auth';
import { authConfig } from './src/lib/auth.config';

// The default export of middleware.ts MUST be the 'auth' function from NextAuth.
// We initialize NextAuth with our edge-safe config and export the resulting `auth` property.
export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except for static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};