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
import { CategoryGrid } from "./_components/category-grid";
import { HomeHero } from "./_components/home-hero";
import { PrimaryButton } from "@/components/primary-button";
import { Reveal } from "@/components/motion";

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
        <div className="aurora-mid" />
        <div className="noise" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-28 text-center sm:py-36">
          <HomeHero totalApps={totalApps} totalDevs={totalDevs} />

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
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
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
          </Reveal>
          <FeaturedBento apps={featured} />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
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
          </Reveal>
          <CategoryGrid
            categories={categories.map((c, i) => ({
              ...c,
              gradient: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length],
            }))}
          />
        </div>
      </section>

      {/* LATEST */}
      <section className="relative pb-32 pt-12">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
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
          </Reveal>
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
    <div className="mb-12 flex items-end justify-between gap-6">
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
  "linear-gradient(135deg, rgba(236,72,153,0.20), transparent 60%)",
  "linear-gradient(135deg, rgba(99,102,241,0.20), transparent 60%)",
  "linear-gradient(135deg, rgba(34,211,238,0.20), transparent 60%)",
  "linear-gradient(135deg, rgba(132,204,22,0.20), transparent 60%)",
  "linear-gradient(135deg, rgba(245,158,11,0.20), transparent 60%)",
  "linear-gradient(135deg, rgba(168,85,247,0.20), transparent 60%)",
];
