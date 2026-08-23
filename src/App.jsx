import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Banner from "./components/banner/Banner";
import Contact from "./components/contact/Contact";
import Skills from "./components/skills/Skills";
import Footer from "./components/footer/Footer";
import FooterBottom from "./components/footer/FooterBottom";
import Navbar from "./components/navbar/Navbar";
import Ticker from "./components/ticker/Ticker";
import Projects from "./components/projects/Projects";
import Cv from "./components/cv/Cv";

const Sudoku = lazy(() => import("./components/sudoku/sudoku"));
const Tanks = lazy(() => import("./components/tanks/tanks-game"));
const PubPoint = lazy(() => import("./components/pubpoint/pubpoint"));
const FinanceDashboard = lazy(() => import("./components/finance/FinanceDashboard"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="site-fx min-h-screen w-full bg-page font-body text-text" id="app">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                <Ticker />
                <Skills />
                <Projects />
                <Cv />
                <Contact />
              </>
            }
          />
          <Route path="/sudoku" element={<Suspense fallback={null}><Sudoku /></Suspense>} />
          <Route path="/tanks" element={<Suspense fallback={null}><Tanks /></Suspense>} />
          <Route path="/pubpoint" element={<Suspense fallback={null}><PubPoint /></Suspense>} />
          <Route path="/finance" element={<Suspense fallback={null}><FinanceDashboard /></Suspense>} />
        </Routes>
        <Footer />
        <FooterBottom />
      </div>
    </Router>
  );
}

export default App;
