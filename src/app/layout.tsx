import type { Metadata } from 'next';
import { Providers } from '@/components/shared/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventForge — All-in-one event platform',
  description:
    'EventForge is the all-in-one event platform for planning, promotion, and RSVP management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
