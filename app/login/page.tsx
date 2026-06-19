'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-orange-50 px-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      {/* 🚀 Wrapped inside a Suspense Boundary to unlock production build passing */}
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 font-medium animate-pulse">Setting up secure login entry...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}