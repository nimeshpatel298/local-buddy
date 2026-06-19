'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // 💡 Safely wrapped within Suspense parent
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (roleParam === 'customer') {
      setEmail('customer@localbuddy.com');
    } else if (roleParam === 'buddy') {
      setEmail('buddy@localbuddy.com');
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('email', { email: email.toLowerCase().trim(), redirect: false });
      setLoading(false);
      if (res && (res as any).error) {
        setError((res as any).error || 'Unable to send sign-in link.');
        return;
      }
      setSuccess('Sign-in link sent. Check your email.');
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl shadow-orange-200/50 p-8 md:p-10">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/localbuddy-logo.png" 
              alt="LocalBuddy Logo" 
              width={64}
              height={64}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LocalBuddy</h1>
          <p className="text-gray-500 text-sm">Connect with local buddies for hourly services</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-emerald-800 text-sm font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:shadow-lg hover:shadow-orange-200/50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-8 mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-500 font-medium">Demo Credentials</span>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setEmail('customer@localbuddy.com')}>
            <p className="text-xs font-semibold text-blue-900">Customer</p>
            <p className="text-sm text-blue-700 font-mono">customer@localbuddy.com</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-300 transition-colors cursor-pointer" onClick={() => setEmail('buddy@localbuddy.com')}>
            <p className="text-xs font-semibold text-orange-900">Buddy (Onboarding)</p>
            <p className="text-sm text-orange-700 font-mono">buddy@localbuddy.com</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => setEmail('admin@localbuddy.com')}>
            <p className="text-xs font-semibold text-purple-900">Admin</p>
            <p className="text-sm text-purple-700 font-mono">admin@localbuddy.com</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Go back to <a href="/" className="text-blue-600 hover:text-blue-700 font-semibold">Home</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold mr-4">Sign up</a>
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold">Forgot password?</a>
          </p>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">Click any email above to auto-fill, or enter your own</p>
      </div>
    </div>
  );
}