import React, { useState, useRef, useEffect } from 'react';
import { solveMatrix, randomSudoku, wakeUpDatabase, wakeUpSolver } from '../../api/api';

const SudokuSolver = () => {
  const [isInitializing, setIsInitializing] = useState(true);

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

  useEffect(() => {
    const initializeServices = async () => {
      await Promise.all([wakeUpDatabase(), wakeUpSolver()]);
      setIsInitializing(false);
    };
    initializeServices();
  }, []);

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
      className="animate-spin h-5 w-5 text-accent"
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

  const errorBox = <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 relative mb-4 w-full max-w-2xl text-red-300">
    <span className="block sm:inline">{error}</span>
    <button
      onClick={() => setError('')} // Close button clears the error
      className="absolute top-0 bottom-0 right-0 px-4 py-3"
    >
      <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <title>Close</title>
        <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
      </svg>
    </button>
  </div>;

  if (isInitializing) {
    return (
      <section className="w-full py-8 pb-12 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-accent mb-4"
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
          </svg>
          <p className="text-xl text-muted">I pay for the cheap AWS so please wait for the functions to wake up 😁</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 pb-12 flex flex-col items-center min-h-screen">
      <p className="kicker mb-3">№ 06 — Play</p>
      <h1 className="font-display text-4xl font-bold tracking-tight mb-8">Sudoku Solver</h1>
      {error && (errorBox)}
      <div className="grid grid-cols-9 rounded-md bg-white p-[2px] shadow-shadowOne ring-2 ring-slate-900">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={value === 0 ? '' : value}
              ref={(el) => (inputRefs.current[rowIndex][colIndex] = el)}
              onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white text-center border border-gray-300 font-bold text-lg md:text-xl focus:outline-none focus:bg-blue-100
              ${rowIndex % 3 === 0 ? 'border-t-2 border-t-slate-900' : ''} 
              ${colIndex % 3 === 0 ? 'border-l-2 border-l-slate-900' : ''} 
              ${rowIndex % 3 === 2 ? 'border-b-2 border-b-slate-900' : ''} 
              ${colIndex % 3 === 2 ? 'border-r-2 border-r-slate-900' : ''}
              ${solvedCells[rowIndex][colIndex] ? 'text-blue-600' : 'text-slate-900'} 
            `}
              maxLength="1"
            />
          )))}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={randomGrid}
          className="btn-solid mt-8 px-6 w-24"
          disabled={randomIsLoading || solveIsLoading}
          title="AWS is expensive - sometimes the first call is slow :)"
        >
          {randomIsLoading ? (loadingSpinner) : ('Random')}
        </button>
        <button
          onClick={clear}
          className="btn-solid mt-8 px-6 w-24"
          disabled={randomIsLoading || solveIsLoading}
        >
          Clear
        </button>
        <button
          onClick={solveSudoku}
          className="btn-solid mt-8 px-6 w-24"
          disabled={locked}
          title="AWS is expensive - sometimes the first call is slow :)"
        >
          {solveIsLoading ? (loadingSpinner) : ('Solve')}
        </button>
      </div>
      <div
        id="title"
        className="card-dark mt-8 p-6 rounded-lg text-center max-w-2xl mx-auto shadow-shadowOne"
      >
        <h2 className="font-display text-2xl font-bold text-text mb-3">
          Sudoku Solver! 🧩
        </h2>
        <p className="text-muted mb-2">
          Input your own problem to solve using MILP optimization
        </p>
        <p className="text-muted mb-3">
          or click Random to pull an example from the DB.
        </p>
      </div>
    </section>
  );
};

export default SudokuSolver;