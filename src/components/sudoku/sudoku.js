import React, { useState, useRef } from 'react';
import { solveMatrix, randomSudoku } from '../../api/api';

const SudokuSolver = () => {

  const emptyGrid = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));

  const noSolvedCells = Array(9)
    .fill(0)
    .map(() => Array(9).fill(false));

  const [grid, setGrid] = useState(emptyGrid);
  const [locked, setLock] = useState(false);
  const [solveIsLoading, setSolveIsLoading] = useState(false);
  const [randomIsLoading, setRandomIsLoading] = useState(false);
  const [solvedCells, setSolvedCells] = useState(noSolvedCells)
  const [error, setError] = useState('');

  // Control keys refs
  const inputRefs = useRef(Array(9).fill(null).map(() => Array(9).fill(null)));

  const handleChange = (row, col, value) => {
    if (!locked && (value === '' || (/^[1-9]$/.test(value) && value.length === 1))) {
      const newGrid = [...grid];
      newGrid[row][col] = value === '' ? 0 : parseInt(value);
      setGrid(newGrid);
    }
  };

  const handleKeyDown = (e, row, col) => {
    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) inputRefs.current[row - 1][col].focus();
        break;
      case 'ArrowDown':
        if (row < 8) inputRefs.current[row + 1][col].focus();
        break;
      case 'ArrowLeft':
        if (col > 0) inputRefs.current[row][col - 1].focus();
        break;
      case 'ArrowRight':
        if (col < 8) inputRefs.current[row][col + 1].focus();
        break;
      case 'Enter':
        if (col < 8) {
          inputRefs.current[row][col + 1].focus(); // Move to the right if not at the end of the row
        } else if (row < 8) {
          inputRefs.current[row + 1][0].focus(); // Move to the next row if at the end of the current row
        }
        break;
      default:
        break;
    }
  };

  const clear = () => {
    setGrid(emptyGrid);
    setLock(false);
    setSolvedCells(noSolvedCells);
  }

  const randomGrid = async () => {
    setLock(true);
    setRandomIsLoading(true);
    const data = await randomSudoku();
    console.log(data)
    if (data && data.result && !data.error) {
      setGrid(data.result.grid);
      setSolvedCells(noSolvedCells);
    }
    else {
      console.error('Error returned from database:', data.error.message);
      setError(data.error.message);
    }
    setRandomIsLoading(false);
    setLock(false);
  }

  const solveSudoku = async () => {
    try {
      setLock(true);
      setSolveIsLoading(true);

      var cellsToSolve = Array(9).fill(0).map(() => Array(9).fill(false));
      grid.forEach((row, i) => {
        row.forEach((value, j) => {
          cellsToSolve[i][j] = value === 0;
        });
      });

      const data = await solveMatrix(grid);

      if (data && data.result && !data.error) {
        setGrid(data.result.matrix);
        setSolvedCells(cellsToSolve);
      }
      else {
        console.error('Error returned from solver:', data.error.message);
        setError(data.error.message);
        setLock(false);
      }
    } catch (error) {
      console.error('Error solving Sudoku:', error.message);
      setError(error.message);
      setLock(false);
    }
    setSolveIsLoading(false);
  };

  const loadingSpinner =
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>;

  const errorBox = <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-1/2">
    <span className="block sm:inline">{error}</span>
    <button
      onClick={() => setError('')} // Close button clears the error
      className="absolute top-0 bottom-0 right-0 px-4 py-3"
    >
      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Close</title>
        <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
      </svg>
    </button>
  </div>;

  return (
    <section className="w-full py-20 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Sudoku Solver</h1>
      {error && (errorBox)}
      <div className="grid grid-cols-9 border-3 border-black">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={value === 0 ? '' : value}
              ref={(el) => (inputRefs.current[rowIndex][colIndex] = el)}
              onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              className={`w-10 h-10 text-center border border-gray-300 font-bold text-xl focus:outline-none
              ${rowIndex % 3 === 0 ? 'border-t-1.5 border-t-black' : ''} 
              ${colIndex % 3 === 0 ? 'border-l-1.5 border-l-black' : ''} 
              ${rowIndex % 3 === 2 ? 'border-b-1.5 border-b-black' : ''} 
              ${colIndex % 3 === 2 ? 'border-r-1.5 border-r-black' : ''}
              ${solvedCells[rowIndex][colIndex] ? 'text-blue-500' : 'text-black'} 
            `}
              maxLength="1"
            />
          )))}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={randomGrid}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-24 flex items-center justify-center"
          disabled={randomIsLoading || solveIsLoading}
          title="AWS is expensive - sometimes the first call is slow :)"
        >
          {randomIsLoading ? (loadingSpinner) : ('Random')}
        </button>
        <button
          onClick={clear}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-24 flex items-center justify-center"
          disabled={randomIsLoading || solveIsLoading}
        >
          Clear
        </button>
        <button
          onClick={solveSudoku}
          className={`mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-24 flex items-center justify-center`}
          disabled={locked}
          title="AWS is expensive - sometimes the first call is slow :)"
        >
          {solveIsLoading ? (loadingSpinner) : ('Solve')}
        </button>
      </div>
      <div
        id="title"
        className="mt-8 p-6 bg-gray-800 border border-gray-600 rounded-lg text-center max-w-2xl mx-auto shadow-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-3">
          Sudoku Solver! 🧩
        </h2>
        <p className="text-gray-300 mb-2">
          Input your own problem to solve using MILP optimization
        </p>
        <p className="text-gray-300 mb-3">
          or click Random to pull an example from the DB.
        </p>
        <p className="text-sm text-red-300 bg-red-900/20 px-3 py-2 rounded border border-red-700/50 inline-block">
          I pay for the cheap AWS so give it a moment to wake up after the first call 😁
        </p>
      </div>
    </section>
  );
};

export default SudokuSolver;