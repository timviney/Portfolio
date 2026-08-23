import React from "react";
import CvCard from "./CvCard";

const Experience = () => {
  return (
    <div className="flex flex-col border-t border-line pt-2">
      <CvCard
        title="Software Developer"
        subTitle="Axi (2024 - 2025)"
        result="London"
        des="Key contributor to the Order Management System, responsible for developing high-impact features and fixing complex trading logic. Expertise spans full-cycle development, from C# Microservices and Azure AKS deployment to performance engineering, including system-wide load testing and DataDog observability."
      />
      <CvCard
        title="Software Developer / Analytical Consultant"
        subTitle="LCP (2019-2024)"
        result="London"
        des="Lead Software Developer responsible for building and maintaining key industrial models using C#, employed by investors, regulators, and the UK government. Head of Optimisation Development, and managed the team's Azure devops."
      />
    </div>
  );
};

export default Experience;
