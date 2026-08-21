/**
 * Modal wrapper for a generated flyer.
 *
 * A dialog rather than an inline expansion because the flyer is portrait and
 * roughly the height of the viewport — pushed inline it would shove the rest of
 * the table off screen, and the point of building from a row is to glance at the
 * artwork and get back to the list.
 *
 * Keyboard behaviour is deliberate: focus moves into the dialog on open and
 * returns to the cell that opened it on close, and Escape dismisses. Without
 * that, keyboard users get stranded behind an overlay they cannot see past.
 */

import { useEffect, useRef } from "react";
import { Flyer } from "./Flyer";
import type { FlyerSpec } from "../types";

export function FlyerModal({ spec, onClose }: {
  spec: FlyerSpec; onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      // Keep Tab inside the dialog while it is open.
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      returnTo.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="flyer-modal" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className="flyer-modal-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Renewal offer flyer for ${spec.customer ?? "customer"}`}
      >
        <header className="flyer-modal-head">
          <div>
            <div className="flyer-modal-eyebrow">Renewal offer flyer</div>
            <div className="flyer-modal-title">{spec.customer}</div>
          </div>
          <button ref={closeRef} className="flyer-modal-close"
                  onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="flyer-modal-body">
          <Flyer spec={spec} />
        </div>
      </div>
    </div>
  );
}
