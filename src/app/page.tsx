// src/app/page.tsx

// This is the main page of our entire application
// In our setup, it will be the dashboard, but we redirect
// to the /login page if the user is not authenticated.
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Since this file lives inside `src/app`, Next.js will treat it as the
// main entry point for our application.
export default async function HomePage() {
  const session = await auth(); // Check if the user is authenticated

  if (!session) {
    redirect('/login'); // Redirect to the login page if not authenticated
  }

  // If authenticated, redirect them to the main dashboard:
  redirect('/dashboard');
}