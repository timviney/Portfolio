import React from 'react'
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { me } from '../../assets/index';
import links from '../../config'
import { Link } from 'react-scroll';

const Footer = () => {
  return (
    <div className="w-full py-20 h-auto border-b-[1px] border-b-black grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-4 gap-8">
      <div className="w-full h-full flex flex-col gap-8">
        <img className="w-32" src={me} alt="me" />
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
      <div className="w-full h-full">
        <h3 className="text-xl uppercase text-designColor tracking-wider">
          Quick Link
        </h3>
        <ul className="flex flex-col gap-4 font-titleFont font-medium py-6 overflow-hidden">
          <li className="relative group cursor-pointer">
            <Link to="home" spy={true} smooth={true} offset={-70} duration={500} className="text-lg hover:text-designColor duration-300 block">
              Home
            </Link>
            <span className="w-full h-[1px] bg-designColor absolute left-0 -bottom-1 -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></span>
          </li>
          <li className="relative group cursor-pointer">
            <Link to="skills" spy={true} smooth={true} offset={-70} duration={500} className="text-lg hover:text-designColor duration-300 block">
              Skills
            </Link>
            <span className="w-full h-[1px] bg-designColor absolute left-0 -bottom-1 -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></span>
          </li>
          <li className="relative group cursor-pointer">
            <Link to="projects" spy={true} smooth={true} offset={-70} duration={500} className="text-lg hover:text-designColor duration-300 block">
              Projects
            </Link>
            <span className="w-full h-[1px] bg-designColor absolute left-0 -bottom-1 -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></span>
          </li>
          <li className="relative group cursor-pointer">
            <Link to="cv" spy={true} smooth={true} offset={-70} duration={500} className="text-lg hover:text-designColor duration-300 block">
              CV
            </Link>
            <span className="w-full h-[1px] bg-designColor absolute left-0 -bottom-1 -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></span>
          </li>
          <li className="relative group cursor-pointer">
            <Link to="contact" spy={true} smooth={true} offset={-70} duration={500} className="text-lg hover:text-designColor duration-300 block">
              Contact
            </Link>
            <span className="w-full h-[1px] bg-designColor absolute left-0 -bottom-1 -translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer