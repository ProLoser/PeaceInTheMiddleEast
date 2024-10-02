import { useReducer, useContext, useEffect } from "react";
import { MultiplayerContext, type GameType } from "../Online/Contexts";
import firebase from "firebase/compat/app";

// White = Positive, Black = Negative
const DEFAULT_BOARD = [
	5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
];

function rollDie() {
	return Math.floor(Math.random() * 6) + 1;
}

function vibrate() {
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

interface MoveAction {
	type: typeof Actions.MOVE;
	data: {
		from: number | "white" | "black";
		to: number;
	};
}

interface SetGameAction {
	type: typeof Actions.SET_GAME;
	data: GameType;
}

interface RollAction {
	type: typeof Actions.ROLL;
	data: {
		dice: number[];
	};
}

type Action = MoveAction | SetGameAction | RollAction;

export enum Actions {
	LOAD = "LOAD",
	ROLL = "ROLL",
	MOVE = "MOVE",
	SET_GAME = "SET_GAME",
}

const firstGame = newGame();

function calculate(state: GameType, from: number | "white" | "black", to: number) {
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

function reducer(state: GameType, action: Action): GameType {
	switch (action.type) {
		case Actions.SET_GAME:
			return { ...state, ...action.data  };
		case Actions.ROLL:
			return { ...state, dice: action.data.dice };
		default:
			return state;
	}
}

export default function useGameState(gameId?: string) {
	const [state, dispatch] = useReducer(reducer, firstGame);
	const { move: sendMove } = useContext(MultiplayerContext);

	useEffect(() => {
		if (gameId) {
			const gameRef = firebase.database().ref(`games/${gameId}`)
			const onValue = (snapshot: firebase.database.DataSnapshot) => {
				const value = snapshot.val();
				if (value) {
					dispatch({ type: Actions.SET_GAME, data: value });
				} else {
					dispatch({ type: Actions.SET_GAME, data: firstGame });
					gameRef.set(firstGame);
				}
			};
			gameRef.on("value", onValue);
			return () => {
				gameRef.off("value", onValue);
			};
		}
	}, [gameId]);

	const rollDice = () => {
		const newDice = [rollDie(), rollDie()];
		dispatch({ type: Actions.ROLL, data: { dice: newDice } });
		const audio = new Audio('./shake-and-roll-dice-soundbible.mp3');
		audio.play();
		vibrate();
		if (gameId)
			firebase.database().ref(`games/${gameId}/dice`).set(newDice);
	};

	const move = (from: number | "white" | "black", to: number) => {
		const { state: nextState, moveLabel } = calculate(state, from, to);
		if (!moveLabel) return;
		dispatch({ type: Actions.SET_GAME, data: nextState });
		// dispatch({ type: Actions.MOVE, data: { from, to } });
		sendMove(nextState, `${nextState.dice.join("-")}: ${moveLabel}`);
	};

    const reset = () => {
		if (confirm('Are you sure you want to reset the match?')) {
			console.log('Resetting', gameId);
			let data = newGame()
			if (gameId)
				firebase.database().ref(`games/${gameId}`).set(data);
			dispatch({ type: Actions.SET_GAME, data });
		}
	}

	return {
		state,
		rollDice,
		move,
		reset,
	};
}
