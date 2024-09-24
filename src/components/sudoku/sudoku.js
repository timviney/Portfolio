import React, { useState, useRef } from 'react';

const SudokuSolver = () => {

  const emptyGrid = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));

  const noSolvedCells = Array(9)
    .fill(0)
    .map(() => Array(9).fill(false));

  const [grid, setGrid] = useState(emptyGrid);
  const [locked, setLock] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [solvedCells, setSolvedCells] = useState(noSolvedCells)

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

  const solveSudoku = async () => {
    setLock(true);
    setLoading(true);
    const post = {
      method: 'solveMatrix',
      matrix: grid,
    };
    var cellsToSolve = Array(9).fill(0).map(() => Array(9).fill(false));
    grid.forEach((row, i) => {
      row.forEach((value, j) => {
        cellsToSolve[i][j] = value === 0;
      });
    });
    try {
      const response = await fetch('https://jt3ypgjdsh.execute-api.eu-north-1.amazonaws.com/prod/sudoku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      if (data && data.result.matrix) {
        setGrid(data.result.matrix);
        setSolvedCells(cellsToSolve);
      }
      else throw data.error;
    } catch (error) {
      console.error('Error solving Sudoku:', error);
    }
    setLoading(false);
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

  return (
    <section className="w-full py-20 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Sudoku Solver</h1>
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
          onClick={clear}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-24"
          disabled = {isLoading}
        >
          Clear
        </button>
        <button
          onClick={solveSudoku}
          className={`mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-24 flex items-center justify-center`}
          disabled={isLoading}
        >
          {isLoading ? (loadingSpinner) : ('Solve')}
        </button>
      </div>
    </section>
  );
};

export default SudokuSolver;