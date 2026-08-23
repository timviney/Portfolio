import React from "react";
import { TbMathFunction, TbBrandCSharp, TbCloudComputing } from "react-icons/tb";
import { VscAzureDevops, VscAzure } from "react-icons/vsc";
import { HiOutlineLightBulb } from "react-icons/hi";
import Title from "../layouts/Title";
import Reveal from "../../hooks/Reveal";

const skills = [
  {
    title: "C# Backend Development",
    des: "6 years' experience building and maintaining key industrial models and applications, employed by investors, regulators, and the UK government.",
    icon: <TbBrandCSharp />,
  },
  {
    title: "Mathematical Modelling",
    des: "Previous Head of Optimisation Development at LCP Delta, focussing on optimising industrial battery energy trading strategies.",
    icon: <TbMathFunction />,
  },
  {
    title: "Azure Devops",
    des: "4 years' experience managing CI/CD processes through Azure pipelines. Confident in yaml, powershell, and automated testing and releasing process.",
    icon: <VscAzureDevops />,
  },
  {
    title: "Cloud Computing",
    des: "Experienced in Distributed Systems, from Azure VMs to Microservices / Hexagonal Architecture via AKS. Scaled specialised compute using Azure Batch for high-throughput parallel modelling simulations.",
    icon: <TbCloudComputing />,
  },
  {
    title: "Analytical Consultant",
    des: "5 years' experience as a Consultant for LCP Delta. Comfortable with data analysis and financial forecasting, translating complex data into actionable insights and effectively communicating results to stakeholders.",
    icon: <HiOutlineLightBulb />,
  },
  {
    title: "Azure & AWS Services",
    des: "Experienced in using a wide range of Azure services such as AKS, Function apps and CosmosDb. Personal projects hosted via AWS services including Lambda, S3, and CloudFront.",
    icon: <VscAzure />,
  },
];

const Skills = () => {
  return (
    <section id="skills" className="w-full py-20 md:py-24">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Title number="02" title="Skills" des="My Experience" />

        <div className="flex flex-col border-t border-line">
          {skills.map((skill, i) => (
            <Reveal key={skill.title} delay={i * 60}>
              <article className="group grid cursor-default grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-line py-7 transition-colors duration-300 hover:bg-panel md:grid-cols-[56px_44px_1fr] md:items-center md:gap-x-8 md:px-4">
                <span className="font-mono text-sm text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-3xl text-muted transition-colors duration-300 group-hover:text-accent md:text-4xl">
                  {skill.icon}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-text md:text-2xl">
                    {skill.title}
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-base leading-relaxed text-muted">
                    {skill.des}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
