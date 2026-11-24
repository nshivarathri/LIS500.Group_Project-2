import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
/**
 * A pop-up dialog (used for the "brains behind the bunny" model panel).
 * Accessibility behaviour:
 * - Escape, the X button, or clicking the dark backdrop closes it.
 * - Tab / Shift+Tab cycle focus inside the dialog ("focus trap"), so keyboard
 *   users cannot tab into the page behind it.
 * - The page behind stops scrolling while it is open.
 * - On close, focus returns to whatever button opened it.
 */
export default function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const box = useRef<HTMLElement>(null),
    // Keep the latest close() in a ref so the key listener (added once) never
    // calls an out-of-date version.
    onClose = useRef(close);
  onClose.current = close;
  useEffect(() => {
    // Remember what had focus and the page's scroll setting, to restore later.
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.querySelector<HTMLElement>("button")?.focus(); // focus the X button
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose.current();
      if (e.key === "Tab") {
        // Find every visible, focusable element in the dialog and wrap focus
        // from the last back to the first (and the reverse with Shift).
        const items = Array.from(
          box.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select,summary,a[href]",
          ) || [],
        ).filter((e) => e.getClientRects().length);
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        // Only close on the backdrop itself, not on clicks inside the dialog.
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <button className="close" aria-label="Close dialog" onClick={close}>
          <X size={21} />
        </button>
        <h2 id="dialog-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}
