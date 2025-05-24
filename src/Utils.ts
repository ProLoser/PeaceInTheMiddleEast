
import { type GameType } from "./Types";
// Removed isValidMove import

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
export function calculate(state: GameType, from: number | "white" | "black", to: number | "off"): { state: GameType; moveLabel?: string } {
    const playerColor = state.color;
    if (!playerColor) return { state }; // No player color, invalid state
    const playerSign = playerColor === 'white' ? 1 : -1;
    const opponentSign = -playerSign;
    const [d1, d2] = state.dice; // These are the available dice
    let moveDistance = 0;
    let isValidDieMatch = false;

    // Handle Re-entry from Bar
    if (from === 'white' || from === 'black') {
        if (typeof to === 'off') return { state }; // Cannot re-enter to 'off'

        if (from === 'white') {
            if (state.prison.white === 0) return { state }; // No pieces on bar
            moveDistance = (to as number) + 1; // Target point (0-5) + 1 gives die value
            if ((to as number) < 0 || (to as number) > 5) return { state }; // Invalid target for white re-entry
        } else { // from === 'black'
            if (state.prison.black === 0) return { state };
            moveDistance = 24 - (to as number); // Target point (18-23)
            if ((to as number) < 18 || (to as number) > 23) return { state }; // Invalid target for black re-entry
        }

        if (d1 === moveDistance || d2 === moveDistance) isValidDieMatch = true;
        if (!isValidDieMatch) return { state };

        const destPieceCount = state.board[to as number];
        if (Math.sign(destPieceCount) === opponentSign && Math.abs(destPieceCount) > 1) return { state }; // Blocked
    }
    // Handle Standard Moves and Bearing Off (from is a number)
    else if (typeof from === 'number') {
        if (Math.sign(state.board[from]) !== playerSign) return { state }; // Not player's piece

        if (to === 'off') { // Bearing Off
            let canBearOff = true;
            if (playerColor === 'white') {
                if (state.prison.white > 0) canBearOff = false;
                for (let i = 6; i < 24; i++) if (state.board[i] * playerSign > 0) canBearOff = false;
                if (!canBearOff) return { state };
                moveDistance = from + 1; // e.g., point 1 (idx 0) is 1 pip to off
            } else { // Black
                if (state.prison.black > 0) canBearOff = false;
                for (let i = 0; i < 18; i++) if (state.board[i] * playerSign > 0) canBearOff = false;
                if (!canBearOff) return { state };
                moveDistance = 24 - from; // e.g., point 24 (idx 23) is 1 pip to off
            }

            if (d1 === moveDistance || d2 === moveDistance) {
                isValidDieMatch = true;
            } else {
                const higherDie = (d1 > moveDistance) ? d1 : ((d2 > moveDistance) ? d2 : 0);
                if (higherDie > 0) {
                    let isFurthest = true;
                    if (playerColor === 'white') {
                        for (let i = from + 1; i < 6; i++) if (state.board[i] * playerSign > 0) isFurthest = false;
                    } else { // Black
                        for (let i = from - 1; i > 17; i--) if (state.board[i] * playerSign > 0) isFurthest = false;
                    }
                    if (isFurthest) isValidDieMatch = true;
                }
            }
        } else { // Standard Move (to is a number)
             if (typeof to !== 'number') return { state }; // Should not happen if to !== 'off'

            if (playerColor === 'white' && to >= from) return { state };
            if (playerColor === 'black' && to <= from) return { state };
            moveDistance = Math.abs(from - to);
            if (d1 === moveDistance || d2 === moveDistance) isValidDieMatch = true;

            const destPieceCount = state.board[to as number];
            if (Math.sign(destPieceCount) === opponentSign && Math.abs(destPieceCount) > 1) return { state }; // Blocked
        }
        if (!isValidDieMatch) return { state };
    } else {
      return { state }; // Invalid 'from' type if not 'white', 'black', or number
    }

    // If all checks passed, create nextGame and apply changes:
    const nextGame = newGame(state); // Deep copy
    let moveLabel = '';
    const opponentColor = playerColor === 'white' ? 'black' : 'white';


    if (from === 'white') {
        nextGame.prison.white--;
        moveLabel = `bar/${(to as number) + 1}`;
        if (Math.sign(nextGame.board[to as number]) === opponentSign && Math.abs(nextGame.board[to as number]) === 1) { // Hit blot
            nextGame.prison[opponentColor]++;
            nextGame.board[to as number] = playerSign; moveLabel += '*';
        } else {
             nextGame.board[to as number] += playerSign;
        }
    } else if (from === 'black') {
        nextGame.prison.black--;
        moveLabel = `bar/${(to as number) + 1}`;
        if (Math.sign(nextGame.board[to as number]) === opponentSign && Math.abs(nextGame.board[to as number]) === 1) { // Hit blot
            nextGame.prison[opponentColor]++;
            nextGame.board[to as number] = playerSign; moveLabel += '*';
        } else {
            nextGame.board[to as number] += playerSign;
        }
    } else if (to === 'off') { // from is number
        nextGame.board[from as number] -= playerSign;
        nextGame.home[playerColor!]++; // playerColor is confirmed not null
        moveLabel = `${(from as number) + 1}/off`;
    } else { // Standard move from board point (from is number) to board point (to is number)
        nextGame.board[from as number] -= playerSign;
        moveLabel = `${(from as number) + 1}/${(to as number) + 1}`;
        if (Math.sign(nextGame.board[to as number]) === opponentSign && Math.abs(nextGame.board[to as number]) === 1) { // Hit blot
            nextGame.prison[opponentColor]++;
            nextGame.board[to as number] = playerSign; moveLabel += '*';
        } else {
            nextGame.board[to as number] += playerSign;
        }
    }
    nextGame.status = 'moved';
    return { state: nextGame, moveLabel };
}