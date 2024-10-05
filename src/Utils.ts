
import { type GameType } from "./Types";

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
    status: "",
    board: [...(oldGame?.board || DEFAULT_BOARD)],
    dice: oldGame?.dice || [6, 6],
    prison: oldGame?.prison || {
        black: 0,
        white: 0,
    },
    home: oldGame?.home || {
        black: 0,
        white: 0,
    },
} as GameType);

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
    }
    return { state: nextGame, moveLabel };
}