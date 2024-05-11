import React from 'react'
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { FaLinkedinIn } from "react-icons/fa";
import tailwindSettings from '../../tailwind-settings.json';
import links from '../../config';

const LeftBanner = () => {
    const [text] = useTypewriter({
      words: ["C# Developer.","Analytical Consultant.", "Software Engineer."],
      loop: true,
      typeSpeed: 20,
      deleteSpeed: 10,
      delaySpeed: 2000,
    });
    const designColor = tailwindSettings.designColor;
  return (
    <div className="w-full lgl:w-1/2 flex flex-col gap-20">
      <div className="flex flex-col gap-5">
        <h1 className="text-6xl font-bold text-white">
          Hi, I'm <span className="name-break text-designColor capitalize">Tim Viney</span>
        </h1>
        <h2 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-4xl font-bold text-white">
          <span>{text}</span>
          <Cursor
            cursorBlinking="false"
            cursorStyle="|"
            cursorColor={designColor}
          />
        </h2>
        <p className="text-base font-bodyFont leading-6 tracking-wide">
        Over 4 years' experience in building and maintaining models and applications.
        </p>
      </div>
      <div className="flex flex-col xl:flex-row gap-6 lgl:gap-0 justify-between">
        <div>
          <h2 className="text-base uppercase font-titleFont mb-4">
            Find me on
          </h2>
          <div className="flex gap-4">
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="bannerIcon">
                <FaLinkedinIn />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftBanner