import React from 'react'
import { TbMathFunction, TbBrandCSharp, TbCloudComputing } from "react-icons/tb";
import { SiAzuredevops, SiAzurefunctions } from "react-icons/si";
import { HiOutlineLightBulb } from "react-icons/hi";
import Title from '../layouts/Title';
import Card from './Card';

const Skills = () => {
  return (
    <section
      id="skills"
      className="w-full py-20 border-b-[1px] border-b-black"
    >
      <div className="flex justify-center items-center text-center">
        <Title
          title="Skills"
          des="My Experience"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-20">
        <Card
          title="C# Backend Development"
          des="5 years' experience building and maintaining key industrial models and applications,
           employed by investors, regulators, and the UK government."
          icon={<TbBrandCSharp />}
        />
        <Card
          title="Mathematical Modelling"
          des="Previous Head of Optimisation Development at LCP Delta, focussing on optimising industrial battery
            energy trading strategies."
          icon={<TbMathFunction />}
        />
        <Card
          title="Azure Devops"
          des="3 years' experience managing CI/CD processes through Azure pipelines. Confident in yaml, powershell, 
            and automated testing and releasing process."
          icon={<SiAzuredevops />}
        />
        <Card
          title="Cloud Computing"
          des="3 years' experience running parallel modelling simulations using Azure Batch, reducing run time of
            simulations by up to 100x compared to single processes."
          icon={<TbCloudComputing />}
        />
        <Card
          title="Analytical Consultant"
          des="5 years' experience as a Consultant for LCP Delta. Comfortable with data analysis and financial forecasting,
           translating complex data into actionable insights and effectively communicating results to stakeholders."
          icon={<HiOutlineLightBulb />}
        />
        <Card
          title="Azure Services"
          des="Experienced in using a wide range of Azure services such as Function apps and CosmosDb."
          icon={<SiAzurefunctions />}
        />
      </div>
    </section>
  );
}

export default Skills