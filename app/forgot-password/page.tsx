'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('email', { email: email.toLowerCase().trim(), redirect: false });
      setLoading(false);
      if (res && (res as any).error) {
        setError((res as any).error || 'Unable to send reset link.');
        return;
      }
      setSuccess('If an account exists, a sign-in link has been sent to your email.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white via-blue-50 to-orange-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image src="/localbuddy-logo.png" alt="LocalBuddy" width={56} height={56} priority />
            </div>
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-gray-500">We'll send a sign-in link to your email to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@domain.com"
                disabled={loading}
                required
              />
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}
            {success && <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remembered your password? <a href="/login" className="text-blue-600 font-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
