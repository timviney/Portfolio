import React from 'react'
import { BsGithub } from "react-icons/bs";
import { FaGlobe } from "react-icons/fa";

const ProjectsCard = ({ title, des, src }) => {
  return (
    <div 
      className="w-full p-4 xl:px-12 h-auto xl:py-10 rounded-lg shadow-shadowOne flex flex-col bg-gradient-to-r from-bodyColor to-[#202327] group hover:bg-gradient-to-b hover:from-gray-900 hover:gray-900 transition-colors duration-1000"
      onClick={click}>
      <div className="w-full h-[80%] overflow-hidden rounded-lg">
        <img
          className="w-full h-60 object-cover group-hover:scale-110 duration-300 cursor-pointer"
          src={src}
          alt="src"
        />
      </div>
      <div className="w-full mt-5 flex flex-col  gap-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base uppercase text-designColor font-normal">
              {title}
            </h3>
            <div className="flex gap-2">
              <span className="text-lg w-10 h-10 rounded-full bg-black inline-flex justify-center items-center text-gray-400 hover:text-designColor duration-300 cursor-pointer">
                <BsGithub />
              </span>
              <span className="text-lg w-10 h-10 rounded-full bg-black inline-flex justify-center items-center text-gray-400 hover:text-designColor duration-300 cursor-pointer">
                <FaGlobe />
              </span>
            </div>
          </div>
          <p className="text-sm tracking-wide mt-3 hover:text-gray-100 duration-300">
            {des}
          </p>
        </div>
      </div>
    </div>
  );
}

const click = () =>{
  sendMatrix(matrix)
}

async function sendMatrix(matrix) {
  const response = await fetch('https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/<resource>', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ matrix: matrix })
  });

  if (!response.ok) {
    const message = `An error has occurred: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  console.log(data);
}

// Example matrix
const matrix = [
  [2,0,9,0,0,0,6,0,0],
  [0,4,0,8,7,0,0,1,2],
  [8,0,0,0,1,9,0,4,0],
  [0,3,0,7,0,0,8,0,1],
  [0,6,5,0,0,8,0,3,0],
  [1,0,0,0,3,0,0,0,7],
  [0,0,0,6,5,0,7,0,9],
  [6,0,4,0,0,0,0,2,0],
  [0,8,0,3,0,1,4,5,0]
];

sendMatrix(matrix).catch(error => {
  console.error('Error:', error);
});

export default ProjectsCard