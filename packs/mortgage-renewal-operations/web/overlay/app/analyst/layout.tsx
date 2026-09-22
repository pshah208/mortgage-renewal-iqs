import { UserChip } from '@/components/auth/UserChip';
import { DisplaySettings } from '@/components/chat/DisplaySettings';
import { DashboardNav } from '@/components/nav/DashboardNav';

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="theme-analyst relative min-h-screen bg-background text-foreground"
      style={
        {
          '--primary': '213 96% 30%',
          '--primary-foreground': '0 0% 100%',
          '--ring': '213 96% 30%',
          '--grid-line': 'color-mix(in srgb, var(--story-ink) 14%, transparent)',
          '--grid-line-strong':
            'color-mix(in srgb, var(--story-ink) 30%, transparent)',
          '--grid-muted': 'color-mix(in srgb, var(--story-ink) 58%, white)',
          '--grid-soft': 'color-mix(in srgb, var(--story-ink) 42%, white)',
          '--grid-tint': 'color-mix(in srgb, var(--story-accent) 8%, white)',
          '--grid-track': 'color-mix(in srgb, var(--story-ink) 12%, white)',
        } as React.CSSProperties
      }
    >
      <DashboardNav
        active="workspace"
        right={
          <>
            <DisplaySettings />
            <UserChip />
          </>
        }
      />
      {children}
    </div>
  );
}
