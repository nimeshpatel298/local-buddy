'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State to hold the role once extracted from the landing URL
  const [activeRole, setActiveRole] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role) {
      // 1. Save it locally in component memory to drive the dynamic footer
      setActiveRole(role);
      
      // 2. Clear the query string from the browser address bar immediately
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

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

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password: password,
        redirect: false,
      });
      
      setLoading(false);
      if (res && (res as any).error) {
        setError((res as any).error || 'Invalid credentials.');
        return;
      }
      setSuccess('Successfully signed in!');
      router.replace('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8">
      {/* Top Main Brand Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-1">
          <div className="relative w-5 h-5">
            <Image src="/localbuddy-logo.png" alt="Logo Pin" fill className="object-contain" priority />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Local<span className="text-orange-500">Buddy</span>
          </span>
        </div>
      </div>

      {/* Main Vector Illustration Showcase */}
      <div className="relative w-full h-56 mb-6 rounded-2xl overflow-hidden flex justify-center items-center">
        <Image 
          src="/welcome-illustration.jpg" 
          alt="Local Buddy Illustration" 
          width={320}
          height={220}
          className="object-contain"
          priority
        />
      </div>

      {/* Greetings Headline Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back!</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to continue.</p>
      </div>

      {/* Main Action Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-800">
              Password
            </label>
            <a href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 17.654 17.654m-2.015-2.015a3.75 3.75 0 1 1-5.325-5.325" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
        {success && <p className="text-emerald-500 text-xs font-semibold">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 via-orange-500 to-orange-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Section Divider */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold">OR</span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      {/* OAuth Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={() => signIn('google')}
          className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-gray-50 transition"
        >
          <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={16} height={16} />
          Continue with Google
        </button>
        <button 
          onClick={() => signIn('apple')}
          className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-gray-50 transition"
        >
          <Image src="https://authjs.dev/img/providers/apple.svg" alt="Apple" width={14} height={14} className="dark:invert" />
          Continue with Apple
        </button>
      </div>

      {/* Footer Links with Dynamic Conditional Layout Strings */}
      <div className="text-center space-y-4">
        <p className="text-sm">
          {activeRole === 'buddy' ? (
            <>
              <span className="text-slate-500">Sign in or </span>
              <Link 
                href={`/signup?role=buddy`} 
                className="text-blue-900 font-bold hover:underline"
              >
                Register as Buddy
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-500">Sign in or </span>
              <Link 
                href={activeRole ? `/signup?role=${activeRole}` : '/signup'} 
                className="text-blue-900 font-bold hover:underline"
              >
                Register
              </Link>
            </>
          )}
        </p>

        <p className="text-[10px] text-gray-400 px-4 leading-normal">
          By signing in, you agree to our <a href="/terms" className="underline font-medium text-slate-500">Terms of Service</a> and <a href="/privacy" className="underline font-medium text-slate-500">Privacy Policy</a>.
        </p>

        <div className="pt-2">
          <a href="/support" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            Need help? <span className="text-blue-900 font-bold">Contact Support</span> 
            <svg className="w-3 h-3 text-blue-900 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}