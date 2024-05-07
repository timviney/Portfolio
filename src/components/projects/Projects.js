import React from 'react'
import Title from '../layouts/Title'
import { projectOne, projectTwo } from "../../assets/index";
import ProjectsCard from './ProjectsCard';

const Projects = () => {
  return (
    <section
      id="projects"
      className="w-full py-20 border-b-[1px] border-b-black"
    >
      <div className="flex justify-center items-center text-center">
        <Title
          title="Projects"
          des="Recent Projects"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-14">
        <ProjectsCard
          title="TODO - C# Project"
          des="Maybe some sort of poker calculator, or financial app, or money splitter,
            google maps api that finds the flattest route for cycling?"
          src={projectOne}
        />
        <ProjectsCard
          title="TODO - optimisation"
          des="Maybe a suduko solver in Python?"
          src={projectTwo}
        />
      </div>
    </section>
  );
}

export default Projects