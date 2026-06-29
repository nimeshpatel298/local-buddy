'use client';

import { useState, Suspense } from 'react'; // 💡 Import Suspense
import { useSearchParams, useRouter } from 'next/navigation';

// 1. Move the actual form logic into a sub-component
function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const searchParams = useSearchParams(); // 💡 Safely wrapped inside Suspense now!
  const router = useRouter();
  const token = searchParams.get('token');

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', msg: 'Passwords do not match.' });
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    if (res.ok) {
      setStatus({ type: 'success', msg: 'Password changed! Redirecting...' });
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setStatus({ type: 'error', msg: 'Failed to reset password.' });
    }
  };

  return (
    <form onSubmit={handleResetSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4">
      <h2 className="text-xl font-bold">Reset Your Password</h2>
      <input 
        type="password" 
        placeholder="New Password" 
        onChange={e => setPassword(e.target.value)} 
        className="w-full p-2.5 border rounded-xl bg-white text-gray-900"
        required 
      />
      <input 
        type="password" 
        placeholder="Confirm New Password" 
        onChange={e => setConfirmPassword(e.target.value)} 
        className="w-full p-2.5 border rounded-xl bg-white text-gray-900"
        required 
      />
      {status.msg && <p className={`text-xs ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{status.msg}</p>}
      <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-xl font-bold">
        Update Password
      </button>
    </form>
  );
}

// 2. The main page component acts as the Suspense boundary wrapper
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
          <p className="text-gray-500 animate-pulse">Loading secure reset configuration...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}