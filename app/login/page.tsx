import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from 'react';
import LoginForm from './LoginForm';

// 💡 This is now a clean Server Component (no 'use client' at the top)
export default async function LoginPage() {
  // 1. Instantly check if the user is already authenticated on the server side
  const session = await getServerSession();

  // 2. 🔐 If they have a valid token, intercept the request and redirect to the dashboard
  if (session) {
    redirect("/dashboard");
  }

  // 3. If unauthenticated, pass the layout execution down to the client chunks safely
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