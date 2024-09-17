import React, { useState, useRef } from 'react';

const SudokuSolver = () => {
  // Initialize the Sudoku grid with empty values (0)
  const [grid, setGrid] = useState(
    Array(9)
      .fill(0)
      .map(() => Array(9).fill(0))
  );

  // Control keys refs
  const inputRefs = useRef(Array(9).fill(null).map(() => Array(9).fill(null)));

  const handleChange = (row, col, value) => {
    if (value === '' || (/^[1-9]$/.test(value) && value.length === 1)) {
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

  const solveSudoku = async () => {
    const post = {
      method: 'solveMatrix',
      matrix: grid,
    };

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
      if (data && data.matrix) {
        setGrid(data.matrix);
      }
    } catch (error) {
      console.error('Error solving Sudoku:', error);
    }
  };

  return (
    <section className="w-full py-20 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Sudoku Solver</h1>
      <div className="grid grid-cols-9 gap-[1px] border-3 border-black">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              value={value === 0 ? '' : value}
              ref={(el) => (inputRefs.current[rowIndex][colIndex] = el)}
              onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              className={`w-10 h-10 text-center border border-gray-300 text-black font-bold text-xl focus:outline-none
                ${rowIndex % 3 === 0 && rowIndex !== 0 ? 'border-t-1.5 border-t-black' : ''} 
                ${colIndex % 3 === 0 && colIndex !== 0 ? 'border-l-1.5 border-l-black' : ''} 
                ${rowIndex % 3 === 2 && rowIndex !== 8 ? 'border-b-1.5 border-b-black' : ''} 
                ${colIndex % 3 === 2 && colIndex !== 8 ? 'border-r-1.5 border-r-black' : ''} 
              `}
              maxLength="1"
            />
          ))
        )}
      </div>
      <button
        onClick={solveSudoku}
        className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Solve
      </button>
    </section>
  );
};

export default SudokuSolver;