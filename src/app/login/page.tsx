'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error(
        result.error === 'CredentialsSignin'
          ? 'Invalid email or password.'
          : 'An unknown error occurred.'
      );
    } else if (result?.ok) {
      toast.success('Logged in successfully!');
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-skin-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-skin-card rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-skin-text">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-skin-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-skin-card border-skin-border text-skin-text focus:ring-skin-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-skin-text"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-skin-card border-skin-border text-skin-text focus:ring-skin-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 font-semibold text-white bg-skin-accent rounded-md hover:brightness-110 disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-skin-text">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-skin-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
