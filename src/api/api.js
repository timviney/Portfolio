const sudokuApi = process.env.REACT_APP_SUDOKU_URL; //test
const dataAccessApi = process.env.REACT_APP_DATAACCESS_URL;

export const wakeUpDatabase = async () => {
    const post = {
        table: "SudokuProblems",
        method: "wakeUp",
        requestParameters: {}
    };
    const response = await fetch(dataAccessApi, {
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

    return await response.json();
};

export const wakeUpSolver = async () => {
    const post = {
        method: 'wakeUp',
    };
    const response = await fetch(sudokuApi, {
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

    return await response.json();
};

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

    if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        throw new Error(message);
    }

    return await response.json();
};

export const randomSudoku = async () => {
    const post = {
        table: "SudokuProblems",
        method: "random",
        requestParameters: {
            difficulty: "medium"
        }
    };
    const response = await fetch(dataAccessApi, {
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

    return await response.json();
};