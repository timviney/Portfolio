import React from "react";
import Reveal from "../../hooks/Reveal";

/**
 * Section header: numbered mono kicker + large display heading.
 * Preserves the original title/des copy from the old Title component.
 */
const Title = ({ number, title, des }) => {
  return (
    <Reveal className="mb-14 flex flex-col gap-4 font-display">
      <div className="flex items-baseline justify-between gap-2">
        <p className="kicker">
          № {number} &mdash; {title}
        </p>
        <span aria-hidden className="h-px flex-1 bg-line"></span>
      </div>
      <h1 className="text-4xl font-bold capitalize tracking-tight text-text md:text-5xl">
        {des}
      </h1>
    </Reveal>
  );
};

export default Title;
