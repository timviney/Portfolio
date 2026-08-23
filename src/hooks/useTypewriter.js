import { useEffect, useRef, useState } from "react";

/**
 * Minimal typewriter: cycles through words, typing then deleting each.
 *
 * Implementation builds the full type/delete timeline once, then a single
 * requestAnimationFrame loop renders whatever the timeline says should be
 * visible at (elapsed % cycleDuration). No timer chains, no effect restarts —
 * deterministic under StrictMode, fast refresh, and re-renders.
 */
function buildCycle(words, typeSpeed, deleteSpeed, delaySpeed) {
  const frames = []; // [timeOffsetMs, displayString]
  let t = 0;
  for (const word of words) {
    for (let c = 1; c <= word.length; c++) {
      frames.push([t, word.slice(0, c)]);
      t += typeSpeed;
    }
    t += delaySpeed;
    for (let c = word.length - 1; c >= 0; c--) {
      frames.push([t, word.slice(0, c)]);
      t += deleteSpeed;
    }
    t += 300; // beat of silence before the next word
  }
  return { frames, duration: t };
}

function displayAt(frames, elapsed) {
  let out = "";
  for (const [time, str] of frames) {
    if (time <= elapsed) out = str;
    else break;
  }
  return out;
}

export default function useTypewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  delaySpeed = 1800,
}) {
  const [text, setText] = useState("");
  const prevRef = useRef("");

  useEffect(() => {
    const { frames, duration } = buildCycle(words, typeSpeed, deleteSpeed, delaySpeed);
    const start = performance.now();
    let frame;

    const loop = (now) => {
      const next = displayAt(frames, (now - start) % duration);
      if (next !== prevRef.current) {
        prevRef.current = next;
        setText(next);
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return text;
}
