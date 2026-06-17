'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    const userStatus = sessionStorage.getItem('userStatus');

    if (userId && userRole) {
      // Redirect to appropriate dashboard
      if (userRole === 'CUSTOMER') {
        router.push('/customer/dashboard');
      } else if (userRole === 'BUDDY') {
        router.push(
          userStatus === 'registered'
            ? '/buddy/dashboard'
            : '/buddy/onboarding'
        );
      } else if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
