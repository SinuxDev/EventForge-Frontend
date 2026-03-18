'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NewEventPanelPage() {
  const { status, data: session } = useSession();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d13] px-6 text-white">
        <p className="text-sm text-white/70">Loading your event workspace...</p>
      </main>
    );
  }

  if (status !== 'authenticated' || !session?.user?.email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d13] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-white/5 p-8 text-center backdrop-blur">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-3 text-sm text-white/70">
            Please sign in first to access your event creation panel.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#10121a] transition hover:bg-[#f2f2f2]"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  if (session.user.role !== 'organizer' && session.user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d13] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-white/5 p-8 text-center backdrop-blur">
          <h1 className="text-2xl font-semibold">Organizer access required</h1>
          <p className="mt-3 text-sm text-white/70">
            Upgrade to organizer role to create and publish events.
          </p>
          <Link
            href="/dashboard/attendee"
            className="mt-6 inline-flex rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go to attendee dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d13] px-6 py-16 text-white">
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-white/12 bg-white/5 p-8 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">EventForge Workspace</p>
        <h1 className="mt-3 text-3xl font-bold">Event Creation Panel</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          You are signed in and ready to create a new event. We can now wire your full event form,
          schedule builder, and ticket setup flow here.
        </p>
      </section>
    </main>
  );
}
