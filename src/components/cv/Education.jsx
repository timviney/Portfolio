import React from "react";
import CvCard from "./CvCard";

const Education = () => {
  return (
    <div className="flex flex-col border-t border-line pt-2">
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
  );
};

export default Education;
