import React, { useState } from "react";
import Title from "../layouts/Title";
import Experience from "./Experience";
import Education from "./Education";

const Cv = () => {
  const [experienceData, setExperienceData] = useState(true);
  const [educationData, setEducationData] = useState(false);

  const tabClass = (active) =>
    `cursor-pointer rounded-md border px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-all duration-300 ${
      active
        ? "border-accent bg-accent font-bold text-page"
        : "border-line bg-panel text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <section id="cv" className="w-full py-20 md:py-24">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Title number="04" title="CV" des="Work and Education" />

        <ul className="mb-10 flex flex-wrap gap-3">
          <li>
            <button
              onClick={() => {
                setExperienceData(true);
                setEducationData(false);
              }}
              className={tabClass(experienceData)}
            >
              Experience
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setExperienceData(false);
                setEducationData(true);
              }}
              className={tabClass(educationData)}
            >
              Education
            </button>
          </li>
        </ul>

        <div key={experienceData ? "exp" : "edu"} className="fade-swap">
          {experienceData && <Experience />}
          {educationData && <Education />}
        </div>
      </div>
    </section>
  );
};

export default Cv;
