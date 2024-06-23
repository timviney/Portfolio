import React, {  useState } from 'react'
import Title from '../layouts/Title';
import Education from './Education';
import Experience from "./Experience"

const Cv = () => {
   const [experienceData, setExperienceData] = useState(true);
   const [educationData, setEducationData] = useState(false);
  return (
    <section id="cv" className="w-full py-20 border-b-[1px] border-b-black">
      <div className="flex justify-center items-center text-center">
        <Title title="CV" des="Work and Education" />
      </div>
      <div>
        <ul className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
          <li
            onClick={() =>
              setExperienceData(true) &
              setEducationData(false)
            }
            className={`${
              experienceData
                ? "border-designColor rounded-lg"
                : "border-transparent"
            } cvLi`}
          >
            Experience
          </li>
          <li
            onClick={() =>
              setExperienceData(false) &
              setEducationData(true)
            }
            className={`${
              educationData
                ? "border-designColor rounded-lg"
                : "border-transparent"
            } cvLi`}
          >
            Education
          </li>
        </ul>
      </div>
      {experienceData && <Experience />}
      {educationData && <Education />}
    </section>
  );
}

export default Cv