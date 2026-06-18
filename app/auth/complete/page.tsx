'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default function AuthCompletePage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session && (session as any).user) {
        const role = (session as any).user.role || 'CUSTOMER';
        if (role === 'ADMIN') router.replace('/admin/dashboard');
        else if (role === 'BUDDY') router.replace('/buddy/dashboard');
        else router.replace('/customer/dashboard');
      } else {
        // If no session, go back to login
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">Signing you in…</p>
        <p className="text-sm text-gray-500 mt-2">If you are not redirected automatically, click <a href="/login" className="text-blue-600">here</a>.</p>
      </div>
    </div>
  );
}
