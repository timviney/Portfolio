import { useEffect, useRef } from "react";

const ROLES = ["C# Developer.", "Analytical Consultant.", "Software Engineer."];
const CELLS = Math.max(...ROLES.map((r) => r.length));
const HOLD_MS = 2800;
const FLIP_MS = 110;
const STAGGER_MS = 26;

/**
 * Departure-board style role display. Renders CELLS split-flap tiles and
 * ripple-flips only the changed positions when rotating through ROLES.
 * Self-contained after mount: no React state, no re-renders, WAAPI flips.
 */
export default function RoleBoard() {
  const boardRef = useRef(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const faces = [];
    for (let i = 0; i < CELLS; i++) {
      const cell = document.createElement("span");
      cell.className = "flap";
      const face = document.createElement("span");
      face.className = "flap-char";
      cell.appendChild(face);
      board.appendChild(cell);
      faces.push(face);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = ROLES.map((r) => r.toUpperCase().padEnd(CELLS, " "));
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

    const paint = (face, ch) => {
      face.textContent = ch.trim() ? ch : "";
      face.classList.toggle("is-accent", ch === ".");
    };

    const flipCell = (i, ch) => {
      const face = faces[i];
      if (reduced) {
        later(() => paint(face, ch), i * STAGGER_MS);
        return;
      }
      later(() => {
        face.animate(
          [
            { transform: "rotateX(0deg)", filter: "brightness(1)" },
            {
              transform: "rotateX(86deg)",
              filter: "brightness(2.2) saturate(0.5)",
              offset: 0.5,
            },
            { transform: "rotateX(0deg)", filter: "brightness(1)" },
          ],
          { duration: FLIP_MS * 2, easing: "ease-in-out" },
        );
      }, i * STAGGER_MS);
      later(() => paint(face, ch), i * STAGGER_MS + FLIP_MS - 10);
    };

    const showWord = (word) => {
      let lastChanged = 0;
      [...word].forEach((ch, i) => {
        const next = ch.trim() ? ch : "";
        if (faces[i].textContent !== next) {
          flipCell(i, ch);
          lastChanged = i;
        }
      });
      return lastChanged * STAGGER_MS + FLIP_MS * 2;
    };

    // Static first paint — no animation cost before interaction.
    [...words[0]].forEach((ch, i) => paint(faces[i], ch));

    const next = () => {
      idx = (idx + 1) % words.length;
      board.setAttribute("aria-label", words[idx].trim());
      const settleMs = showWord(words[idx]);
      later(next, settleMs + HOLD_MS);
    };
    later(next, HOLD_MS);

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      board.replaceChildren();
    };
  }, []);

  return (
    <>
      <span className="sr-only">
        Roles: C# Developer, Analytical Consultant, Software Engineer
      </span>
      <span ref={boardRef} className="role-board" aria-hidden="true" />
    </>
  );
}
