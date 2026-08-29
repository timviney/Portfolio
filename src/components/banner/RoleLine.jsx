import { useEffect, useRef } from "react";

const ROLES = ["C# Developer.", "Analytical Consultant.", "Software Engineer."];
const HOLD_MS = 3800;
const OUT_MS = 260;
const IN_MS = 420;

/**
 * Low-key rotating role line: the current role eases up and fades out, the
 * next drifts up into place. Matches the site's rise/reveal motion language.
 * Static first paint, imperative swaps after mount, no React re-renders.
 */
export default function RoleLine() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const textEl = el.querySelector(".role-line-text");
    const dotEl = el.querySelector(".role-line-dot");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = new Set();
    let disposed = false;
    let idx = 0;

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!disposed) fn();
      }, ms);
      timers.add(id);
    };

    const apply = (role) => {
      const head = role.slice(0, -1); // trailing period is the accent dot
      textEl.textContent = head;
      dotEl.textContent = ".";
    };

    const swap = () => {
      idx = (idx + 1) % ROLES.length;
      const role = ROLES[idx];

      if (reduced) {
        apply(role);
      } else {
        el.style.transition = `opacity ${OUT_MS}ms ease-in, transform ${OUT_MS}ms ease-in`;
        el.style.opacity = "0";
        el.style.transform = "translateY(-9px)";
        later(() => {
          apply(role);
          el.style.transition = `opacity ${IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, OUT_MS + 30);
      }

      later(swap, HOLD_MS);
    };

    later(swap, HOLD_MS);

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <span className="sr-only overflow-hidden">
        Roles: C# Developer, Analytical Consultant, Software Engineer
      </span>
      <span
        ref={ref}
        className="role-line inline-block leading-tight h-[2lh] sm:min-h-0"
        aria-hidden="true"
      >
        <span className="role-line-text">C# Developer</span>
        <span className="role-line-dot">.</span>
      </span>
    </>
  );
}
