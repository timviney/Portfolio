import React from "react";
import { BsGithub } from "react-icons/bs";
import { FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const ProjectsCard = ({ title, des, src, githubRepo, sitePage, index, feature = false }) => {
  const navigate = useNavigate();

  const handleImageClick = () => {
    if (sitePage) {
      navigate("/" + sitePage);
      scrollToTop();
    } else {
      window.open(githubRepo);
    }
  };

  const handleSiteLink = () => {
    if (sitePage) {
      navigate("/" + sitePage);
      scrollToTop();
    }
  };

  const handleGithubLink = () => {
    if (githubRepo) window.open(githubRepo);
  };

  return (
    <article
      className={`group flex h-full flex-col border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-shadowOne ${
        feature ? "md:flex-row" : ""
      }`}
    >
      <div
        className={`overflow-hidden border-b border-line ${
          feature ? "md:w-[55%] md:border-b-0 md:border-r" : ""
        }`}
      >
        <img
          src={src}
          alt="src"
          loading="lazy"
          onClick={handleImageClick}
          className={`w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            feature ? "h-56 md:h-full md:min-h-[320px]" : "h-48"
          }`}
        />
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-6 ${feature ? "md:p-8" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.26em] text-accent">
              {String(index).padStart(2, "0")}
            </p>
            <h3
              className={`font-display font-semibold tracking-tight text-text ${
                feature ? "text-2xl md:text-3xl" : "text-xl"
              }`}
            >
              {title}
            </h3>
          </div>
          <div className="flex shrink-0 gap-2 pt-1">
            {githubRepo && (
              <button
                onClick={handleGithubLink}
                aria-label={`${title} source on GitHub`}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <BsGithub />
              </button>
            )}
            {sitePage && (
              <button
                onClick={handleSiteLink}
                aria-label={`Open ${title}`}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <FaGlobe />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed tracking-wide text-muted">{des}</p>
      </div>
    </article>
  );
};

export default ProjectsCard;
