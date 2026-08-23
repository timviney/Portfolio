import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import links from "../../config";
import { navLinksdata } from "../../constants";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [pendingScroll, setPendingScroll] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pendingScroll && location.pathname === "/") {
      scrollToPage(pendingScroll);
      setPendingScroll(null);
    }
  }, [location, pendingScroll]);

  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  const handleNavigation = (section) => {
    if (location.pathname !== "/") {
      setPendingScroll(section);
      navigate("/");
    } else if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollToPage(section);
    }
  };

  function scrollToPage(section) {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-8">
        <button
          onClick={() => handleNavigation("home")}
          className="group cursor-pointer font-display text-xl font-bold tracking-tight text-text transition-colors hover:text-accent"
        >
          Tim Viney<span className="text-accent">.</span>
        </button>

        <nav className="hidden items-center gap-8 mdl:flex">
          {navLinksdata.map(({ _id, title, link }, i) => (
            <button
              key={_id}
              onClick={() => handleNavigation(link)}
              className="nav-link cursor-pointer"
            >
              <span className="mr-1 text-accent/60">0{i + 1}</span> {title}
            </button>
          ))}
        </nav>

        <span
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Open menu"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-line bg-panel text-lg text-muted transition-colors hover:border-accent hover:text-accent mdl:hidden"
        >
          <FiMenu />
        </span>
      </div>

      {/* Mobile menu */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-page px-6 py-6 scrollbar-hide mdl:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-text">
              Tim Viney<span className="text-accent">.</span>
            </span>
            <span
              onClick={() => setShowMenu(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-line text-xl text-muted hover:border-accent hover:text-accent"
            >
              <MdClose />
            </span>
          </div>
          <ul className="mt-12 flex flex-col">
            {navLinksdata.map((item, i) => (
              <li key={item._id} className="border-b border-line-soft">
                <button
                  onClick={() => {
                    handleNavigation(item.link);
                    setShowMenu(false);
                  }}
                  className="rise flex w-full cursor-pointer items-baseline gap-4 py-5 text-left"
                  style={{ "--d": `${100 + i * 70}ms` }}
                >
                  <span className="font-mono text-xs text-accent">
                    0{i + 1}
                  </span>
                  <span className="font-display text-3xl font-semibold text-text">
                    {item.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="rise mt-10" style={{ "--d": "460ms" }}>
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
      )}
    </header>
  );
};

export default Navbar;
