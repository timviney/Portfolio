import React from "react";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { me } from "../../assets/index";
import links from "../../config";

const quickLinks = ["home", "skills", "projects", "cv", "contact"];

const labelFor = (id) => (id === "cv" ? "CV" : id.charAt(0).toUpperCase() + id.slice(1));

function scrollTo(id) {
  id === "home"
    ? window.scrollTo({ top: 0, behavior: "smooth" })
    : document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const Footer = () => {
  return (
    <div className="border-t border-line bg-panel/40">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:px-8 lgl:grid-cols-4">
        <div className="flex h-full flex-col gap-8 lgl:col-span-2">
          <img className="w-32 rounded-md border border-line" src={me} alt="me" />
          <div className="flex gap-4">
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="bannerIcon !h-12 !w-12">
                <FaLinkedinIn />
              </span>
            </a>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              <span className="bannerIcon !h-12 !w-12">
                <FaGithub />
              </span>
            </a>
          </div>
        </div>

        <div className="h-full w-full">
          <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-accent">
            Quick Link
          </h3>
          <ul className="flex flex-col gap-4 overflow-hidden py-1">
            {quickLinks.map((id) => (
              <li key={id} className="group relative cursor-pointer">
                <button
                  onClick={() => scrollTo(id)}
                  className="block cursor-pointer bg-transparent text-base text-muted transition-colors duration-300 hover:text-accent"
                >
                  {labelFor(id)}
                </button>
                <span className="absolute -bottom-0.5 left-0 h-px w-full -translate-x-[101%] bg-accent transition-transform duration-300 group-hover:translate-x-0"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
