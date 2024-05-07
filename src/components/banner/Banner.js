import React from 'react'
import LeftBanner from './LeftBanner';
const Banner = () => {
  return (
    <section
      id="home"
      className="w-full min-h-screen pt-10 pb-20 flex flex-col justify-center border-b-[1px] font-titleFont border-b-black"
    >
      <LeftBanner />
    </section>
  );
}

export default Banner