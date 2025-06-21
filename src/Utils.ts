import { Color, Status, type GameType } from "./Types";

// White = Positive, Black = Negative
export const DEFAULT_BOARD: GameType['board'] = [
    // index:           6             11
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    // index:         18              23
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
];

const HOME_INDEXES = {
    white: [18, 23],
    black: [6, 11]
}

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
    status: oldGame?.status || 'rolling'
} as GameType);

export function nextMove(state: GameType, usedDice: number[] = [], from?: number) {
    const availableMoves = new Set<number>();
    const player = state.color;
    const playerSign = player === 'white' ? 1 : -1;
    const [homeStart, homeEnd] = HOME_INDEXES[player]
    const availableDice = [...state.dice]
    // Check for Doubles
    if (availableDice[0] === availableDice[1]) availableDice.push(availableDice[0], availableDice[0])
        // Filter used 
    usedDice.forEach(die => {
        const index = availableDice.indexOf(die)  
        if (~index) availableDice.splice(index,1)
    })
    
    const populated = (pieces: number) => playerSign * pieces > 0
    const unprotected = (pieces: number) => playerSign * pieces <= 1;
    const allHome = () => 
        15 === state.board
          .slice(homeStart, homeEnd)
          .reduce(
              (total, value) => total + Math.abs(value), 
              state.home[player]
          )

    const farthestHome = () => {
        for (let point = homeStart; point <= homeEnd; point++) {
            if (populated(state.board[point])) {
                return point
            }
        }
        return 0;
    }

    const destination = (point: number, die: number) => {
        let newPoint;
        if (player === Color.White) {
            if (point > 11) { // bottom
                newPoint = point + die // right
                if (newPoint > homeEnd) return -1; // off
                return newPoint;
            } else { // top
                let newPoint = point - die; // left
                if (newPoint < 0) return 11 + -1 * newPoint // wrap 
                return newPoint
            }
        } else { // black
            if (point < 12) { // top
                newPoint = point + die; // right
                if (newPoint > 11) return -1; // off
                return newPoint;
            } else { // bottom
                let newPoint = point - die; // left
                if (newPoint < 12) return Math.abs(newPoint - 12) // wrap 
                return newPoint
            }
        }
    }
    
    if (from === undefined) { // calculate starting points
        if (state.prison[player]) { // pieces are on bar
            availableDice.forEach(die => {
                const point = player == 'white' ? 12 - die : 24 - die
                if (unprotected(state.board[point]))
                    availableMoves.add(point)
            })
        } else { 
            // normal moves
            state.board.forEach((value, point) => {
                if (
                    populated(value)
                    && availableDice.find(die => {
                        return unprotected(point + die * playerSign)
                    })
                )
                    availableMoves.add(point)
            })

            if (allHome()) { // bear off moves
                const farthestPoint = farthestHome()
                availableDice.forEach(die => {
                    const point = homeEnd - die + 1
                    if (
                        populated(state.board[point]) // exact
                        || die > homeEnd - farthestPoint // within
                    ) {
                        availableMoves.add(point)
                    }
                })
            }
        }
    } else { // calculate destinations, assume only valid from points are provided
        availableDice.forEach(die => {
            const point = destination(from, die)
            if (point !== undefined && (point === -1 || unprotected(state.board[point])))
                availableMoves.add(point)
        })
    }
    
    return availableMoves
}

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

        nextGame.status = nextGame.home.white === 15 || nextGame.home.black === 15 ?
            Status.GameOver : Status.Rolling;
    }
    return { state: nextGame, moveLabel };
}

const audioCache: { [key: string]: HTMLAudioElement } = {};

const checkerSounds = [
  'capture.mp3',
  'castle.mp3',
  'move-check.mp3',
  'move-self.mp3',
  'notify.mp3',
  'promote.mp3',
];

checkerSounds.forEach(file => {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = file;
  audioCache[file] = audio;
});

export const playCheckerSound = () => {
  const randomIndex = Math.floor(Math.random() * checkerSounds.length);
  const randomMp3 = checkerSounds[randomIndex];
  
  const audio = audioCache[randomMp3];
  audio.currentTime = 0;
  audio.play();
};
