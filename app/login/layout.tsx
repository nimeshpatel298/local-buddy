import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - LocalBuddy',
  description: 'Sign in to your LocalBuddy account',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
