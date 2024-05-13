import './Game.css';
import Dice from './Dice';
import Point from './Piece';
import { useCallback, useState } from 'react';

const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
]

export default function Game() {
    const [home, setHome] = useState(() => [0, 0])
    const [board, setBoard] = useState(() => [...DEFAULT_BOARD])
    const [dice, setDice] = useState(() => [6, 6])



    const reset = useCallback(() => {
        // TODO: skip confirmation if game is over?
        if (!confirm('Are you sure you want to restart the game?')) { return; }

        setBoard(DEFAULT_BOARD);
    }, [])

    const move = useCallback((from: number, to: number) => {
        const fromPieces = board[from];
        if (!fromPieces) return;

        // TODO: Validate moves against dice

        if (to === -1) {
            // TODO: bear off piece
        } else if (board[to] === 1) {
            board[to] = -1;
            // TODO: move piece to bar
        } else if (board[to] === -1) {
            board[to] = 1;
            // TODO: move piece to bar
        } else if (board[to] > 0 && fromPieces > 0) {
            board[to]++;
            board[from]--;
        } else if (board[to] < 0 && fromPieces < 0) {
            board[to]--;
            board[from]++;
        } else {
            return
        }
        setBoard([...board]);
    }, [board])

    const roll = useCallback(() => {
        let first = Math.floor(Math.random() * 6) + 1;
        let second = Math.floor(Math.random() * 6) + 1;
        setDice([first, second])
    }, [])


    return <div id="board">
        <Dice onClick={roll} values={dice} />

        {board.slice(0, 12).map((pieces, index) => <Point pieces={pieces} move={move} position={index} />)}
        <div className="bar"></div>
        <div className="bar"></div>
        {board.slice(12).map((pieces, index) => <Point pieces={pieces} move={move} position={index} />)}
        <div className="home"></div>
        <div className="home"></div>
    </div >;
}