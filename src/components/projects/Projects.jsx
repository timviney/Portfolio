import React from "react";
import Title from "../layouts/Title";
import Reveal from "../../hooks/Reveal";
import {
  projectSudoku,
  projectDataAccess,
  projectTanks,
  projectAlgotrader,
  projectPubPoint,
  projectMarketData,
} from "../../assets/index";
import ProjectsCard from "./ProjectsCard";

const Projects = () => {
  return (
    <section id="projects" className="w-full py-20 md:py-24">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Title number="03" title="Projects" des="Recent Projects" />

        <div className="grid grid-cols-1 gap-6 lgl:grid-cols-2">
          <Reveal>
            <ProjectsCard
              feature
              index={1}
              title="Market Data Pipeline"
              des="A market data replay engine and dashboard. Simulates real-time data ingestion, performing tick calculations and utilising Kafka for decoupled persistence and live updates via SignalR."
              src={projectMarketData}
              githubRepo={"https://github.com/timviney/MarketDataPipeline"}
            />
          </Reveal>
          <Reveal delay={120}>
            <ProjectsCard
              feature
              index={2}
              title="Algotrader"
              des="A C# .NET 8 algorithmic trading backtesting engine that evaluates trading strategies using historical intraday stock market data."
              src={projectAlgotrader}
              githubRepo={"https://github.com/timviney/Algotrader"}
            />
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Reveal>
            <ProjectsCard
              index={3}
              title="PubPoint"
              des="App idea collaboration with @timstu98. An app that finds the most convenient pub for a group to get to. Not as simple as it sounds!"
              src={projectPubPoint}
              sitePage={"pubpoint"}
              githubRepo={"https://github.com/timstu98/PubPoint"}
            />
          </Reveal>
          <Reveal delay={90}>
            <ProjectsCard
              index={4}
              title="Tanks Game"
              des="Tanks Game made with Unity/C#. Uses custom bullet physics, game management and logic for increasing AI difficulty."
              src={projectTanks}
              sitePage={"tanks"}
              githubRepo={"https://github.com/timviney/Tanks"}
            />
          </Reveal>
          <Reveal delay={180}>
            <ProjectsCard
              index={5}
              title="Sudoku Solver"
              des="Solving sudoku problems via linear optimisation. Fill your own or a select a random one from the database."
              src={projectSudoku}
              sitePage={"sudoku"}
              githubRepo={"https://github.com/timviney/Sudoku"}
            />
          </Reveal>
          <Reveal delay={270}>
            <ProjectsCard
              index={6}
              title="Database Access"
              des="Lambda function to sort database access for the site."
              src={projectDataAccess}
              githubRepo={"https://github.com/timviney/DataAccess"}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Projects;
