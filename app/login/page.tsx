'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Invalid email. Please try again.');
        setLoading(false);
        return;
      }

      const user = await res.json();
      
      // Store user session
      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userStatus', user.status || 'active');
      sessionStorage.setItem('userEmail', user.email);

      setSuccess('Sign in successful! Redirecting...');

      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'CUSTOMER') {
          router.push('/customer/dashboard');
        } else if (user.role === 'BUDDY') {
          router.push(
            user.status === 'registered'
              ? '/buddy/dashboard'
              : '/buddy/onboarding'
          );
        } else if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      }, 500);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-orange-50 px-4">
      {/* Decorative background elements - Orange and Blue */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-orange-200/50 p-8 md:p-10">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image 
                src="/logo.png" 
                alt="LocalBuddy Logo" 
                width={120} 
                height={60}
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LocalBuddy</h1>
            <p className="text-gray-500 text-sm">Connect with local buddies for hourly services</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-emerald-800 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:shadow-lg hover:shadow-orange-200/50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-8 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
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
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer" onClick={() => setEmail('buddy@localbuddy.com')}>
              <p className="text-xs font-semibold text-amber-900">Buddy (Onboarding)</p>
              <p className="text-sm text-amber-700 font-mono">buddy@localbuddy.com</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => setEmail('admin@localbuddy.com')}>
              <p className="text-xs font-semibold text-purple-900">Admin</p>
              <p className="text-sm text-purple-700 font-mono">admin@localbuddy.com</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            Click any email above to auto-fill, or enter your own
          </p>
        </div>
      </div>
    </div>
  );
}
