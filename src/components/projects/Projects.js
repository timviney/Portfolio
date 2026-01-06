import React from 'react'
import Title from '../layouts/Title'
import { projectSudoku, projectDataAccess, projectTanks, projectAlgotrader, projectPubPoint, projectMarketData } from "../../assets/index";
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
          title="Market Data Pipeline"
          des="A market data replay engine and dashboard. Simulates real-time data ingestion, performing tick calculations and utilising Kafka for decoupled persistence and live updates via SignalR."
          src={projectMarketData}
          githubRepo={"https://github.com/timviney/MarketDataPipeline"}
        />
        <ProjectsCard
          title="PubPoint"
          des="App idea collaboration with @timstu98. An app that finds the most convenient pub for a group to get to. Not as simple as it sounds!"
          src={projectPubPoint}
          sitePage={"pubpoint"}
          githubRepo={"https://github.com/timstu98/PubPoint"}
        />
        <ProjectsCard
          title="Algotrader"
          des="A C# .NET 8 algorithmic trading backtesting engine that evaluates trading strategies using historical intraday stock market data."
          src={projectAlgotrader}
          githubRepo={"https://github.com/timviney/Algotrader"}
        />
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