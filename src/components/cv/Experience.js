import React from "react";
import { motion } from "framer-motion";
import CvCard from "./CvCard";

const Experience = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      className="w-full flex flex-col lgl:flex-row gap-10 lgl:gap-20"
    >
      <div>
        <div className="py-6 lgl:py-12 font-titleFont flex flex-col gap-4">
          <p className="text-sm text-designColor tracking-[4px]">2019 -</p>
          <h2 className="text-3xl md:text-4xl font-bold">Work Experience</h2>
        </div>
        <div className="mt-6 lgl:mt-14 w-full h-[1000px] border-l-[6px] border-l-black border-opacity-30 flex flex-col gap-10">
          <CvCard
            title="Software Developer"
            subTitle="Axi (2024 - )"
            result="London"
            des="Software Developer in the payments team."
          />
          <CvCard
            title="Software Developer / Analytical Consultant"
            subTitle="LCP (2019-2024)"
            result="London"
            des="Lead Software Developer responsible for building and maintaining key industrial models using C#, employed by investors, regulators, and the UK government.
              Head of Optimisation Development, and managed the team's Azure devops."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Experience;
