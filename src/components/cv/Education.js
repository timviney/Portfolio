import React from "react";
import { motion } from "framer-motion";
import CvCard from "./CvCard";

const Education = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      className="w-full flex flex-col lgl:flex-row gap-10 lgl:gap-20"
    >
      <div>
        <div className="py-6 lgl:py-12 font-titleFont flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold">Education</h2>
        </div>
        <div className="mt-6 lgl:mt-14 w-full h-[1000px] border-l-[6px] border-l-black border-opacity-30 flex flex-col gap-10">
          <CvCard
            title="BSc in Mathematics"
            subTitle="Durham University (2016 - 2019)"
            result="1ˢᵗ class honours"
            des="1ˢᵗ class honours. Recipient of the 3ʳᵈ year project prize for outstanding achievement in dissertation on Bayesian Emulation (awarded 90% mark) – nominated for Rising Stars Research Symposium"
          />
          <CvCard
            title="A-Levels"
            subTitle="Oakham School (2014 - 2016)"
            result="A*A*A*A"
            des="Maths, Further Maths, Chemistry & Physics."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Education;
