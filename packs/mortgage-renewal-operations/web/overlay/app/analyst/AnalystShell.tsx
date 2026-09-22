'use client';

import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { IqChat } from '@/components/iq/IqChat';

const CHAT_MIN_PX = 380;
const WORKSPACE_MIN_PX = 520;
const CHAT_DEFAULT_PX = 560;
const CHAT_STORAGE_KEY = 'mortgageRenewal.analyst.chatWidth.v1';
const NAV_PX = 56;

function clampWidth(value: number, viewport: number): number {
  const max = Math.max(CHAT_MIN_PX, viewport - WORKSPACE_MIN_PX);
  return Math.min(Math.max(value, CHAT_MIN_PX), max);
}

export function AnalystShell({ children }: { children: React.ReactNode }) {
  const [chatWidth, setChatWidth] = useState(CHAT_DEFAULT_PX);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = saved ? Number(saved) : Number.NaN;
      if (Number.isFinite(parsed)) {
        setChatWidth(clampWidth(parsed, window.innerWidth));
      }
    } catch {
      /* stored width is a convenience only */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, String(Math.round(chatWidth)));
    } catch {
      /* ignore */
    }
  }, [chatWidth]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: MouseEvent) => {
      setChatWidth(clampWidth(window.innerWidth - event.clientX, window.innerWidth));
    };
    const onUp = () => setDragging(false);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  return (
    <div
      className="flex min-h-0 w-full"
      style={{ height: `calc(100vh - ${NAV_PX}px)` }}
    >
      <section className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{children}</div>
      </section>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat panel"
        title="Drag to resize"
        onMouseDown={onMouseDown}
        style={{ width: 8 }}
        className="hidden shrink-0 cursor-col-resize select-none items-center justify-center border-x border-[var(--grid-line)] bg-[var(--story-surface)] lg:flex"
      >
        <GripVertical className="h-4 w-4 text-[var(--grid-muted)]" />
      </div>
      <aside
        aria-label="Mortgage Renewal IQ chat"
        className="hidden min-h-0 shrink-0 flex-col lg:flex"
        style={{ width: chatWidth }}
      >
        <IqChat />
      </aside>
    </div>
  );
}
