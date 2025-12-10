import React, { useState, useEffect } from 'react';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { logo, me } from "../../assets/index";
import { navLinksdata } from '../../constants';
import links from '../../config';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [pendingScroll, setPendingScroll] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pendingScroll && location.pathname === '/') {
      scrollToPage(pendingScroll)
      setPendingScroll(null);
    }
  }, [location, pendingScroll]);

  const handleNavigation = (section) => {
    if (location.pathname !== "/") {
      setPendingScroll(section);
      navigate("/");
    } else {
      scrollToPage(section);
    }
  };

  function scrollToPage(section) {
    scroller.scrollTo(section, {
      duration: 500,
      smooth: true,
      offset: -70,
    });
  }

  return (
    <div className="w-full h-24 sticky top-0 z-50 bg-bodyColor mx-auto flex justify-between items-center font-titleFont border-b-[1px] border-b-gray-600">
      <div className="w-full h-24 flex justify-between items-center">
        <ScrollLink to="home" spy={true} smooth={true} offset={-70} duration={500} className="inline-block h-full cursor-pointer">
          <img src={logo} alt="logo" className="h-full max-w-xxs" onClick={() => handleNavigation("home")} />
        </ScrollLink>
      </div>
      <div>
        <ul className="hidden mdl:inline-flex items-center gap-6 lg:gap-10">
          {navLinksdata.map(({ _id, title, link }) => (
            <li
              className="text-base font-normal text-gray-400 tracking-wide cursor-pointer hover:text-designColor duration-300"
              key={_id}
            >
              <span onClick={() => handleNavigation(link)}>{title}</span>
            </li>
          ))}
        </ul>
        <span
          onClick={() => setShowMenu(!showMenu)}
          className="text-xl mdl:hidden bg-black w-10 h-10 inline-flex items-center justify-center rounded-full text-designColor cursor-pointer"
        >
          <FiMenu />
        </span>
        {showMenu && (
          <div className="w-[80%] h-screen overflow-scroll absolute top-0 left-0 bg-gray-900 p-4 scrollbar-hide">
            <div className="flex flex-col gap-8 py-2 relative">
              <div className="w-full h-24">
                <empty></empty>
              </div>
              <div>
                <img className="h-full max-w-xxxs" src={me} alt="me" />
              </div>
              <ul className="flex flex-col gap-4">
                {navLinksdata.map((item) => (
                  <li
                    key={item._id}
                    className="text-base font-normal text-gray-400 tracking-wide cursor-pointer hover:text-designColor duration-300"
                  >
                    <span onClick={() => { handleNavigation(item.link); setShowMenu(false); }}>
                      {item.title}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <h2 className="text-base uppercase font-titleFont mb-4">
                  Find me on
                </h2>
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
              <span
                onClick={() => setShowMenu(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-designColor duration-300 text-2xl cursor-pointer"
              >
                <MdClose />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;