'use client';

import Link from 'next/link';
import { BrandMark, useBrand } from '@/components/brand/BrandProvider';
import { cn } from '@/lib/utils';

type ActiveTab = 'workspace';

export function DashboardNav({
  active,
  right,
  className,
}: {
  active: ActiveTab;
  right?: React.ReactNode;
  className?: string;
}) {
  const brand = useBrand();
  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b-4 border-[var(--story-accent)] bg-[var(--story-ink)] text-white',
        className,
      )}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-[13px] font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[var(--story-highlight)]"
        >
          <BrandMark width={42} height={36} className="h-8 w-auto object-contain" />
          <span className="uppercase tracking-[-0.02em]">
            {brand.organizationName}
          </span>
          <span className="h-4 w-px bg-white/25" />
          <span className="font-semibold text-white/70">
            {active === 'workspace' ? 'Mortgage Renewal Operations' : ''}
          </span>
        </Link>

        <div className="flex items-center gap-1 text-[13px] text-white/70">
          <Link
            href="/story"
            className="mr-2 border border-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] outline-none transition hover:border-[var(--story-highlight)] hover:text-[var(--story-highlight)] focus-visible:border-[var(--story-highlight)] focus-visible:text-[var(--story-highlight)]"
          >
            Guided story
          </Link>
          {right ? <div className="ml-1 flex items-center gap-1">{right}</div> : null}
        </div>
      </nav>
    </header>
  );
}
