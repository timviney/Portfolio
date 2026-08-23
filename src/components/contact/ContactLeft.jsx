import React from "react";
import links from "../../config";
import { contactImg } from "../../assets/index";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";

const ContactLeft = () => {
  return (
    <div className="card-dark flex w-full flex-col justify-center gap-8 rounded-lg p-4 shadow-shadowOne lgl:w-[35%] lgl:p-8">
      <img
        className="mb-2 h-64 w-full rounded-md border border-line-soft object-cover"
        src={contactImg}
        alt="contactImg"
      />
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-3xl font-bold text-text">Tim Viney</h3>
        <p className="text-base font-normal text-muted">Software Developer</p>
        <p className="text-base tracking-wide text-muted">
          Please contact me via email or LinkedIn.
        </p>
        <p className="flex items-center gap-2 text-base text-muted">
          Email: <span className="text-text">t.c.viney@gmail.com</span>
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="label-dark">Find me on</h2>
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
    </div>
  );
};

export default ContactLeft;
