import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Providers } from '@/components/shared/providers';
import { authOptions } from '@/lib/auth-options';
import './globals.css';

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
  const themeInitScript = `
    (function () {
      try {
        var stored = localStorage.getItem('eventforge-ui');
        var theme = 'dark';

        if (stored) {
          var parsed = JSON.parse(stored);
          if (parsed && parsed.state && parsed.state.theme) {
            theme = parsed.state.theme;
          }
        }

        var resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        var root = document.documentElement;
        root.classList.toggle('dark', resolved === 'dark');
        root.dataset.theme = resolved;
      } catch (_) {
        document.documentElement.classList.add('dark');
        document.documentElement.dataset.theme = 'dark';
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
