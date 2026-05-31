"use client";

import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  gradient: string;
  _count: { apps: number };
}

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <StaggerItem key={c.id}>
          <Link
            href={`/categories/${c.slug}`}
            className="group glass relative flex items-center justify-between overflow-hidden rounded-2xl px-5 py-6 transition-transform duration-500 hover:-translate-y-1"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: c.gradient }}
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
        </StaggerItem>
      ))}
    </Stagger>
  );
}
