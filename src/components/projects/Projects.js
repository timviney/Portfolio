import React from 'react'
import Title from '../layouts/Title'
import { projectSudoku, projectDataAccess, projectTanks } from "../../assets/index";
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
          title="Tanks Game"
          des="Tanks Game made with Unity/C#. Uses custom bullet physics, game management and logic for increasing AI difficulty."
          src={projectTanks}
          sitePage={"tanks"}
          githubRepo={"https://github.com/timviney/Tanks"}
        />
        <ProjectsCard
          title="Sudoku Solver"
          des="Solving sudoku problems via linear optimisation. Fill your own or a select a random one from the database."
          src={projectSudoku}
          sitePage={"sudoku"}
          githubRepo={"https://github.com/timviney/Sudoku"}
        />
        <ProjectsCard
          title="Database Access"
          des="Lambda function to sort database access for the site."
          src={projectDataAccess}
          githubRepo={"https://github.com/timviney/DataAccess"}
        />
      </div>
    </section>
  );
}

export default Projects