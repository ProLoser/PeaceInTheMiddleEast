import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import { useCallback, useState, type DragEventHandler } from 'react';


// White = Positive, Black = Negative
const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
]

export default function Game() {
    const [blackHome, setBlackHome] = useState(0)
    const [whiteHome, setWhiteHome] = useState(0)
    const [blackBar, setBlackBar] = useState(0)
    const [whiteBar, setWhiteBar] = useState(0)
    const [board, setBoard] = useState(() => [...DEFAULT_BOARD])
    const [dice, setDice] = useState(() => [6, 6])

    const reset = useCallback(() => {
        // TODO: skip confirmation if game is over?
        if (!confirm('Are you sure you want to restart the game?')) { return; }

        setBoard(DEFAULT_BOARD);
    }, [])

    // TODO: Validate moves against dice
    const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextBoard = [...board];
        if (from == "white") { // white re-enter
            if (board[to] == -1) { // hit
                setBlackBar(bar => bar + 1)
                nextBoard[to] = 0
            }
            if (board[to] >= -1) {
                setWhiteBar(bar => bar - 1)
                nextBoard[to]++
            }
        } else if (from == 'black') { // black re-enter
            if (board[to] == 1) { // hit
                setWhiteBar(bar => bar + 1)
                nextBoard[to] = 0
            }
            if (board[to] <= 1) {
                setBlackBar(bar => bar - 1)
                nextBoard[to]--
            }
        } else {
            const offense = board[from];
            const defense = board[to];

            if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
                nextBoard[to] += Math.sign(offense)
            } else if (to === -1) { // bear off
                if (offense > 0) {
                    setWhiteHome(count => count + 1)
                } else {
                    setBlackHome(count => count + 1)
                }
            } else if (Math.abs(defense) === 1) { // hit
                nextBoard[to] = -Math.sign(defense);
                if (offense > 0)
                    setBlackBar(bar => bar + 1)
                else
                    setWhiteBar(bar => bar + 1)
            } else { // stalemate
                return
            }

            nextBoard[from] -= Math.sign(offense)
        }

        console.log('moveend', nextBoard)
        setBoard([...nextBoard]);
    }, [board])

    const roll = useCallback(() => {
        let first = Math.floor(Math.random() * 6) + 1;
        let second = Math.floor(Math.random() * 6) + 1;
        setDice([first, second])
    }, [])

    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, -1,)
    }, [move])

    return <div id="board">
        <Dice onClick={roll} values={dice} />

        <div className="bar">
            {Array.from({ length: whiteBar }, (_, index) => <Piece key={index} position={-1} color="white" />)}
        </div>
        <div className="bar">
            {Array.from({ length: blackBar }, (_, index) => <Piece key={index} position={-1} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: blackHome }, (_, index) => <Piece key={index} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: whiteHome }, (_, index) => <Piece key={index} color="white" />)}
        </div>
        {board.map((pieces, index) => <Point key={index} pieces={pieces} move={move} position={index} />)}
    </div >;
}