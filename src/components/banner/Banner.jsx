import React from "react";
import useTypewriter from "../../hooks/useTypewriter";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import links from "../../config";
import { cartoonMe } from "../../assets/index";

const Banner = () => {
  const [text] = useTypewriter({
    words: ["C# Developer.", "Analytical Consultant.", "Software Engineer."],
    typeSpeed: 20,
    deleteSpeed: 10,
    delaySpeed: 2000,
  });

  return (
    <section
      id="home"
      className="mx-auto flex max-w-screen-xl flex-col items-center gap-14 px-4 pb-20 pt-16 lgl:flex-row lgl:gap-8 lgl:pt-24 md:px-8"
    >
      <div className="flex w-full flex-col gap-6 lgl:w-1/2">
        <p className="rise kicker" style={{ "--d": "60ms" }}>
          № 01 &mdash; Home
        </p>

        <h1 className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl xl:text-7xl">
          <span className="block overflow-hidden">
            <span className="rise block" style={{ "--d": "140ms" }}>
              Hi, I&apos;m{" "}
              <span className="name-break text-accent">Tim Viney</span>
            </span>
          </span>
        </h1>

        <h2
          className="rise font-display text-2xl font-semibold text-text sm:text-3xl"
          style={{ "--d": "260ms" }}
        >
          {text}
          <span className="cursor-blink text-accent">|</span>
        </h2>

        <p
          className="rise max-w-xl text-base leading-relaxed tracking-wide text-muted"
          style={{ "--d": "360ms" }}
        >
          Over 6 years&apos; experience in building and maintaining models and
          applications.
        </p>

        <div className="rise mt-6" style={{ "--d": "460ms" }}>
          <h2 className="label-dark mb-4">Find me on</h2>
          <div className="flex gap-4">
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="bannerIcon">
                <FaLinkedinIn />
              </span>
            </a>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              <span className="bannerIcon">
                <FaGithub />
              </span>
            </a>
          </div>
        </div>
      </div>

      <figure
        className="rise relative mx-auto w-full max-w-sm lgl:w-1/2 lgl:max-w-md"
        style={{ "--d": "320ms" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-accent/40"
        ></div>
        <div className="fig-frame relative rounded-lg bg-panel shadow-shadowOne">
          <img src={cartoonMe} alt="cartoonMe" className="w-full" />
        </div>
      </figure>
    </section>
  );
};

export default Banner;
