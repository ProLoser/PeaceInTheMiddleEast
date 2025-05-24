
import { type GameType } from "./Types";
import { isValidMove } from "../GameLogic/validation"; // Added import

// White = Positive, Black = Negative
export const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
];

export function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

export function vibrate() {
    navigator.vibrate?.([50, 100, 60, 60, 90, 40, 110, 20, 150]);
}

export const newGame = (oldGame?: GameType) => ({
    board: [...(oldGame?.board || DEFAULT_BOARD)],
    dice: oldGame?.dice || [6, 6],
    color: oldGame?.color || null,
    turn: oldGame?.turn || null,
    prison: oldGame?.prison || {
        black: 0,
        white: 0,
    },
    home: oldGame?.home || {
        black: 0,
        white: 0,
    },
    status: oldGame?.status || null
} as GameType);

/**
 * 
 * @param state 
 * @param from 
 * @param to 
 * @returns moveLabel is not returned if the move is blocked
 */
export function calculate(state: GameType, from: number | "white" | "black", to: number) {
    if (from === to) return { state }; // no move
    const nextGame: GameType = newGame(state);
    let moveLabel: string; // @see https://en.wikipedia.org/wiki/Backgammon_notation
    if (from === "white") {
        // white re-enter
        if (nextGame.board[to] === -1) {
            // hit
            moveLabel = `bar/${to}*`;
            nextGame.prison.black++;
            nextGame.prison.white--;
            nextGame.board[to] = 1;
        } else if (nextGame.board[to] >= -1) {
            // move
            moveLabel = `bar/${to}`;
            nextGame.prison.white--;
            nextGame.board[to]++;
        } else {
            // blocked
            return { state };
        }
    } else if (from === "black") {
        // black re-enter
        if (nextGame.board[to] === 1) {
            // hit
            moveLabel = `bar/${to}*`;
            nextGame.prison.white++;
            nextGame.prison.black--;
            nextGame.board[to] = -1;
        } else if (nextGame.board[to] <= 1) {
            // move
            moveLabel = `bar/${to}`;
            nextGame.prison.black--;
            nextGame.board[to]--;
        } else {
            // blocked
            return { state };
        }
    } else {
        const offense = nextGame.board[from];
        const defense = nextGame.board[to];

        if (defense === undefined) {
            // bear off
            moveLabel = `${from}/off`;
            if (offense > 0) {
                nextGame.home.white++;
            } else {
                nextGame.home.black++;
            }
        } else if (!defense || Math.sign(defense) === Math.sign(offense)) {
            // move
            moveLabel = `${from}/${to}`;
            nextGame.board[to] += Math.sign(offense);
        } else if (Math.abs(defense) === 1) {
            // hit
            moveLabel = `${from}/${to}*`;
            nextGame.board[to] = -Math.sign(defense);
            if (offense > 0) nextGame.prison.black++;
            else nextGame.prison.white++;
        } else {
            // blocked
            return { state };
        }

        // remove from previous position
        nextGame.board[from] -= Math.sign(nextGame.board[from]);

        nextGame.status = 'moved'
    }
    return { state: nextGame, moveLabel };
}

// New function as per prompt
export function calculateNewMove(state: GameType, from: number | "white" | "black", to: number | "off", dieValueUsed: number): { state: GameType; moveLabel?: string } {
    // 2. Inside calculateNewMove call isValidMove
    const valid = isValidMove(state, from, to, dieValueUsed);

    // 3. If valid is false
    if (!valid) {
        return { state, moveLabel: undefined }; // Return the original state
    }

    // 4. If valid is true
    // a. Create nextGame
    const nextGame: GameType = newGame(state); // make a deep copy to modify
    // b. Initialize moveLabel
    let moveLabel: string = '';

    // c. Determine Player Color and Signs
    const playerColor = state.color;
    if (!playerColor) { // Should not happen if isValidMove is robust
        return { state, moveLabel: undefined };
    }
    const playerSign = playerColor === 'white' ? 1 : -1;
    const opponentColor = playerColor === 'white' ? 'black' : 'white'; // For prison
    const opponentSign = -playerSign;

    // d. Apply Move Logic & Generate moveLabel
    if (from === 'white') { // White re-entering
        const toPoint = to as number; // 'to' is guaranteed number by isValidMove
        nextGame.prison.white--;
        moveLabel = `bar/${toPoint + 1}`;
        if (nextGame.board[toPoint] === opponentSign) { // Hit opponent's blot
            nextGame.prison[opponentColor]++;
            nextGame.board[toPoint] = playerSign;
            moveLabel += '*';
        } else {
            nextGame.board[toPoint] += playerSign;
        }
    } else if (from === 'black') { // Black re-entering
        const toPoint = to as number; // 'to' is guaranteed number by isValidMove
        nextGame.prison.black--;
        moveLabel = `bar/${toPoint + 1}`;
        if (nextGame.board[toPoint] === opponentSign) { // Hit opponent's blot
            nextGame.prison[opponentColor]++;
            nextGame.board[toPoint] = playerSign;
            moveLabel += '*';
        } else {
            nextGame.board[toPoint] += playerSign;
        }
    } else if (to === 'off') { // Bearing off
        const fromPoint = from as number; // 'from' is guaranteed number
        nextGame.board[fromPoint] -= playerSign;
        nextGame.home[playerColor]++;
        moveLabel = `${fromPoint + 1}/off`;
    } else { // Standard board move, 'from' and 'to' are numbers
        const fromPoint = from as number;
        const toPoint = to as number;
        nextGame.board[fromPoint] -= playerSign;
        moveLabel = `${fromPoint + 1}/${toPoint + 1}`;
        if (nextGame.board[toPoint] === opponentSign) { // Hit opponent's blot
            nextGame.prison[opponentColor]++;
            nextGame.board[toPoint] = playerSign;
            moveLabel += '*';
        } else {
            nextGame.board[toPoint] += playerSign;
        }
    }

    // e. Consume the dieValueUsed
    const dieIndex = nextGame.dice.indexOf(dieValueUsed);
    if (dieIndex > -1) {
        nextGame.dice[dieIndex] = 0; // Mark die as used (0)
    }

    // f. Set status
    nextGame.status = 'moved'; 
    // g. Return
    return { state: nextGame, moveLabel };
}