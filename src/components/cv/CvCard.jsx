import React from "react";

const CvCard = ({ title, subTitle, result, des }) => {
  return (
    <article className="group grid grid-cols-1 gap-3 border-b border-line py-8 transition-colors duration-300 hover:bg-panel md:grid-cols-[200px_1fr_auto] md:gap-8 md:px-4">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {subTitle}
      </p>
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-text transition-colors duration-300 group-hover:text-accent md:text-2xl">
          {title}
        </h3>
        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed tracking-wide text-muted md:text-base">
          {des}
        </p>
      </div>
      <span className="h-fit rounded-md border border-line bg-panel px-4 py-2 font-mono text-xs text-muted transition-colors duration-300 group-hover:border-accent/60 group-hover:text-text md:justify-self-end">
        {result}
      </span>
    </article>
  );
};

export default CvCard;
