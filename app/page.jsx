import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingFeatured from "@/components/landing-featured";
import { CATEGORIES } from "@/lib/data";

const STEPS = [
  {
    n: "01",
    who: "Attendee",
    title: "Discover",
    body: "Search by city and category. Your location and interests shape the feed.",
  },
  {
    n: "02",
    who: "Attendee",
    title: "Register in two taps",
    body: "Your name and email are pre-filled. Pay at the venue, not online.",
  },
  {
    n: "03",
    who: "Attendee",
    title: "Walk in with a QR",
    body: "Your ticket lives in My tickets, ready to scan at the door.",
  },
  {
    n: "04",
    who: "Organizer",
    title: "Describe it, publish it",
    body: "Tell the AI what you are planning. Review the preview, then go live.",
  },
];

// Decorative QR pattern for the sample ticket (no real data).
function SampleQr() {
  const cells = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const finder =
        (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      let on;
      if (finder) {
        const lx = x > 12 ? x - 14 : x;
        const ly = y > 12 ? y - 14 : y;
        on =
          lx === 0 ||
          lx === 6 ||
          ly === 0 ||
          ly === 6 ||
          (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
        if (lx === 7 || ly === 7) on = false;
      } else {
        on = rand() > 0.5;
      }
      cells.push(on);
    }
  }
  return (
    <div
      aria-hidden="true"
      className="size-[84px] shrink-0 rounded-[10px] bg-white p-1.5 grid grid-cols-[repeat(21,1fr)]"
    >
      {cells.map((on, i) => (
        <i key={i} className={on ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 70% at 25% 0%, var(--glow-1), transparent 70%), radial-gradient(50% 50% at 90% 90%, var(--glow-2), transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20 flex flex-wrap gap-12 items-center">
          <div className="flex-[1_1_420px] min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[13px] text-muted-foreground mb-5">
              <span className="size-2 rounded-full bg-success" />
              Built for events across India
            </div>
            <h1 className="text-[clamp(38px,7vw,72px)] font-bold leading-[1.03] tracking-[-0.04em]">
              Discover &amp; host events{" "}
              <span className="text-brand-gradient">
                worth showing up for
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-[clamp(16px,2vw,19px)] leading-relaxed text-muted-foreground text-pretty">
              From local meetups to full-day festivals. Register in two taps,
              walk in with a QR, and run your own event in minutes, with AI
              doing the typing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl" className="px-7 h-13 gap-2">
                <Link href="/explore">
                  Explore events <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="px-7 h-13 bg-transparent"
              >
                <Link href="/create-event">Host an event</Link>
              </Button>
            </div>
            <p className="mt-5 text-[13px] text-muted-foreground">
              Free to attend · QR tickets · Pay at the venue
            </p>
          </div>

          {/* Sample ticket */}
          <div className="flex-[1_1_300px] flex justify-center" aria-hidden="true">
            <div className="w-[min(320px,100%)] rounded-[28px] border bg-card p-3.5 shadow-[0_30px_80px_-20px_var(--glow-1)]">
              <div className="relative h-36 overflow-hidden rounded-[18px] bg-linear-to-br from-[#2f7d4f] to-[#1c4a31]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.06)_0_10px,transparent_10px_20px)]" />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
                  Sports · Chennai
                </span>
              </div>
              <div className="px-1.5 pt-3.5 pb-1">
                <div className="text-[17px] font-semibold tracking-tight">
                  Sample Cricket Tournament
                </div>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  Sat 28 Nov · 9:00 AM · Kottivakkam
                </div>
              </div>
              <div className="mx-1 mt-3 flex items-center gap-3.5 border-t-2 border-dashed pt-3.5">
                <SampleQr />
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    YOUR TICKET
                  </div>
                  <div className="mt-0.5 font-semibold">Your name</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    HST-XXXXXX
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-[clamp(26px,4vw,38px)] font-bold tracking-tight">
          How it works
        </h2>
        <p className="mt-1.5 mb-6 text-muted-foreground">
          Two sides, one simple loop.
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-5">
              <div className="font-mono text-xs text-brand">
                {s.n} · {s.who}
              </div>
              <div className="mt-2.5 mb-1.5 text-lg font-semibold tracking-tight">
                {s.title}
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live featured events */}
      <LandingFeatured />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="mb-5 text-[clamp(26px,4vw,38px)] font-bold tracking-tight">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/explore/${c.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium hover:border-brand/50 hover:bg-brand-soft transition-colors"
            >
              <span aria-hidden="true">{c.icon}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Plans teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <div className="flex flex-wrap items-center gap-7 rounded-3xl border bg-card p-[clamp(20px,4vw,40px)]">
          <div className="flex-[1_1_280px]">
            <div className="font-mono text-xs text-brand">PLANS</div>
            <h2 className="my-2 text-[clamp(24px,3.6vw,34px)] font-bold tracking-tight">
              Start free. Go Pro when you grow.
            </h2>
            <p className="mb-5 leading-relaxed text-muted-foreground">
              One event on Free. Unlimited events and your own theme colour on
              Pro.
            </p>
            <Button asChild className="h-11 px-5">
              <Link href="/create-event">Create your first event</Link>
            </Button>
          </div>
          <div className="flex-[1_1_320px] grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border p-[18px]">
              <div className="font-semibold">Free</div>
              <ul className="mt-3 space-y-1 text-[13px] leading-relaxed text-muted-foreground">
                <li>1 event</li>
                <li>Default theme</li>
                <li>QR check-in</li>
              </ul>
            </div>
            <div className="rounded-2xl border-[1.5px] border-brand bg-brand-soft p-[18px]">
              <div className="font-semibold">Pro</div>
              <ul className="mt-3 space-y-1 text-[13px] leading-relaxed text-muted-foreground">
                <li>Unlimited events</li>
                <li>Custom theme colour</li>
                <li>Everything in Free</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
