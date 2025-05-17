import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./components/banner/Banner";
import Contact from "./components/contact/Contact";
import Skills from "./components/skills/Skills";
import Footer from "./components/footer/Footer";
import FooterBottom from "./components/footer/FooterBottom";
import Navbar from "./components/navbar/Navbar";
import Projects from "./components/projects/Projects";
import Cv from "./components/cv/Cv";
import Sudoku from "./components/sudoku/sudoku";
import Tanks from "./components/tanks/tanks-game";

function App() {
  return (
    <Router>
      <div className="w-full h-auto bg-bodyColor text-lightText px-4">
        <Navbar />
        <div className="max-w-screen-xl mx-auto">
          <Routes>
            <Route path="/" element={
              <>
                <Banner />
                <Skills />
                <Projects />
                <Cv />
                <Contact />
                <Footer />
                <FooterBottom />
              </>
            } />
            <Route path="/sudoku" element={
              <Sudoku />
              } />
            <Route path="/tanks" element={
              <Tanks />
              } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
