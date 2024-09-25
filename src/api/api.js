
const sudokuApi = process.env.REACT_APP_SUDOKU_URL;

export const solveMatrix = async (grid) => {
    const post = {
        method: 'solveMatrix',
        matrix: grid,
    };
    const response = await fetch(sudokuApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
    });

    return response;
};
