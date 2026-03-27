import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { getServerSession } from 'next-auth';
import Script from 'next/script';
import { Providers } from '@/components/shared/providers';
import { authOptions } from '@/lib/auth-options';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EventForge — All-in-one event platform',
  description:
    'EventForge is the all-in-one event platform for planning, promotion, and RSVP management.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased min-h-screen bg-background font-sans`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
