import Link from "next/link";
import {
  getAllCategories,
  getFeaturedApps,
  getLatestApps,
} from "@/lib/queries/apps";
import { db } from "@/lib/db";
import { FeaturedBento } from "./_components/featured-bento";
import { LatestRail } from "./_components/latest-rail";
import { HeroCounters } from "./_components/hero-counters";
import { PrimaryButton } from "@/components/primary-button";

export const metadata = {
  title: "Storestack — App marketplace for e-commerce merchants",
};

export default async function HomePage() {
  const [featured, latest, categories, totalApps, totalInstalls, totalDevs] =
    await Promise.all([
      getFeaturedApps(6),
      getLatestApps(8),
      getAllCategories(),
      db.app.count({ where: { status: "PUBLISHED" } }),
      db.install.count(),
      db.user.count({ where: { role: "DEVELOPER", status: "ACTIVE" } }),
    ]);

  return (
    <main className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="aurora" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-28 text-center sm:py-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            {totalApps} apps published · {totalDevs} developers
          </div>

          <h1 className="font-display text-5xl text-zinc-50 sm:text-7xl md:text-8xl">
            Run your store.
            <br />
            <span className="text-grad-cool italic">Stack the apps.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            The platform-agnostic marketplace where independent e-commerce
            merchants find apps that extend their store — and developers reach
            them across every storefront.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton href="/apps" size="lg">
              Browse marketplace
            </PrimaryButton>
            <PrimaryButton href="/sign-up/developer" size="lg" variant="ghost">
              Publish your app →
            </PrimaryButton>
          </div>

          <HeroCounters totalApps={totalApps} totalInstalls={totalInstalls} totalDevs={totalDevs} />
        </div>
      </section>

      {/* FEATURED */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Featured"
            title={
              <>
                Apps the team is
                <br />
                <span className="font-display italic text-zinc-200">betting on.</span>
              </>
            }
            cta={{ href: "/apps", label: "All apps" }}
          />
          <FeaturedBento apps={featured} />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Categories"
            title={
              <>
                Six lanes.
                <br />
                <span className="font-display italic text-zinc-200">Pick yours.</span>
              </>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group glass relative flex items-center justify-between overflow-hidden rounded-2xl px-5 py-6 transition-transform hover:-translate-y-1"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length],
                  }}
                />
                <div className="relative">
                  <p className="text-sm font-semibold text-zinc-50">{c.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {c._count.apps} {c._count.apps === 1 ? "app" : "apps"}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="relative text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-zinc-200"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST */}
      <section className="relative pb-32 pt-12">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Latest"
            title={
              <>
                Just landed in
                <br />
                <span className="font-display italic text-zinc-200">the marketplace.</span>
              </>
            }
            cta={{ href: "/apps?sort=newest", label: "View all" }}
          />
          <LatestRail apps={latest} />
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          / {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
          {title}
        </h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="link-underline hidden text-sm font-medium text-zinc-300 hover:text-zinc-50 sm:inline"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

const CATEGORY_GRADIENTS = [
  "linear-gradient(135deg, rgba(139,92,246,0.18), transparent 60%)",
  "linear-gradient(135deg, rgba(34,211,238,0.18), transparent 60%)",
  "linear-gradient(135deg, rgba(16,185,129,0.18), transparent 60%)",
  "linear-gradient(135deg, rgba(245,158,11,0.18), transparent 60%)",
  "linear-gradient(135deg, rgba(244,63,94,0.18), transparent 60%)",
  "linear-gradient(135deg, rgba(217,70,239,0.18), transparent 60%)",
];
