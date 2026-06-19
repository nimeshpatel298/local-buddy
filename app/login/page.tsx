'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 py-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-3xl p-8 flex items-center justify-center min-h-[500px] shadow-sm">
          <p className="text-gray-400 font-medium animate-pulse text-sm">Loading dynamic assets...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}