import './Game.css';
import Dice from './Dice';
import Point from './Point';
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

        if (board[to] === 1) {
            board[to] = -1;
        } else if (board[to] === -1) {
            board[to] = 1;
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

    const onDrop = useCallback((position: number, event: DragEvent) => {
        move(event.dataTransfer.getData('text'), position);
    }, [move])

    return <div id="board">
        <Dice onClick={roll} values={dice} />
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="point"></div>
        <div className="home"></div>
        <div className="home"></div>
    </div >;
    return <>{this.state.board.map((pieces, position) => <Point onDrop={this.onDrop.bind(this, position)} pieces={pieces} position={position} />)}</>;
}