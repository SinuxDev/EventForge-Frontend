const quickStats = [
  { label: 'Events live this week', value: '1,204' },
  { label: 'Average RSVP conversion', value: '87%' },
  { label: 'Avg setup time', value: '24 min' },
];

function AnvilLogo() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8" role="img" aria-label="EventForge logo">
      <defs>
        <linearGradient id="eventForgeLogoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6A1B9A" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      <rect x="8" y="33" width="48" height="12" rx="6" fill="url(#eventForgeLogoGradient)" />
      <rect x="12" y="43" width="40" height="9" rx="4" fill="#12131a" />
      <path
        d="M10 33c3-9 11-14 21-14h12c3 0 5-2 5-5V9h6v7c0 7-5 12-12 12H31c-6 0-11 2-14 5H10z"
        fill="url(#eventForgeLogoGradient)"
      />
      <rect x="43" y="9" width="6" height="8" fill="#12131a" />
      <rect x="40" y="10" width="3" height="13" fill="#12131a" />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-130">
      <div className="absolute inset-0 -z-10 rounded-full bg-radial from-[#FF69B4]/35 via-[#6A1B9A]/20 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#0f1118] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="mx-auto max-w-[320px] rounded-[2.2rem] border border-white/10 bg-[#171a24] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="rounded-[1.8rem] bg-linear-to-b from-[#261b3b] via-[#191a2c] to-[#12131c] p-4">
            <div className="mb-4 h-28 rounded-2xl bg-linear-to-br from-[#ff69b4]/55 via-[#6a1b9a]/50 to-[#2196f3]/40" />
            <div className="space-y-2">
              <p className="font-semibold text-white">Night Shift Festival</p>
              <p className="text-xs text-white/70">Sat, Sep 21 · 7:00 PM · London</p>
            </div>
            <div className="mt-4 h-10 rounded-full bg-linear-to-r from-[#00A896] to-[#2196F3]" />
          </div>
        </div>

        <div className="absolute left-6 top-14 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          RSVP +240 today
        </div>
        <div className="absolute bottom-12 right-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          3 venues synced
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0d13] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(33,150,243,0.2),transparent_42%),radial-gradient(circle_at_75%_24%,rgba(255,105,180,0.16),transparent_45%),radial-gradient(circle_at_52%_80%,rgba(0,168,150,0.14),transparent_40%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 via-transparent to-[#0b0d13]" />
      </div>

      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90"
          >
            <AnvilLogo />
            <span>EventForge</span>
          </a>

          <div className="flex items-center gap-3 text-xs text-white/65 sm:gap-6 sm:text-sm">
            <span className="hidden sm:inline">23:17 GMT+6:30</span>
            <a href="#" className="transition hover:text-white">
              Explore Events ↗
            </a>
            <button className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/15">
              Sign In
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-6 md:pt-16">
        <section className="grid items-center gap-12 md:grid-cols-[1fr_1.1fr] md:gap-8">
          <div className="max-w-xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A896]" />
              All-in-one event platform
            </div>

            <h1 className="text-[2.45rem] leading-[1.05] font-bold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.02]">
              Delightful events
              <br />
              <span className="bg-linear-to-r from-[#5e76ff] via-[#FF69B4] to-[#ff8f32] bg-clip-text text-transparent">
                start here.
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-white/72 md:text-lg">
              Create polished event pages, manage registrations, and track RSVPs from one calm,
              powerful workspace built for modern event teams.
            </p>

            <div>
              <button className="rounded-xl bg-white px-7 py-3 text-base font-semibold text-[#10121a] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-[#f3f3f3]">
                Get Started Free
              </button>
            </div>
          </div>

          <HeroVisual />
        </section>

        <section className="mt-16 rounded-2xl border border-white/12 bg-white/5 p-5 backdrop-blur md:mt-20 md:p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xl font-semibold text-white md:text-2xl">{item.value}</p>
                <p className="text-sm text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
