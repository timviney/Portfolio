import React from "react";

const items = [
  "C#",
  ".NET 8",
  "Azure DevOps",
  "AKS",
  "Azure Batch",
  "CosmosDb",
  "AWS Lambda",
  "S3",
  "CloudFront",
  "Kafka",
  "SignalR",
  "YAML",
  "Powershell",
];

const Ticker = () => {
  const strip = [...items, ...items];
  return (
    <div className="ticker overflow-hidden border-y border-line bg-panel py-2.5">
      <div className="ticker-track">
        {strip.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-6 pr-6 font-mono text-[11px] uppercase tracking-[0.28em] text-muted"
          >
            {item}
            <span aria-hidden className="text-accent">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
