import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import Toolbar from './Toolbar';
import { useCallback, useState, type DragEventHandler } from 'react';


// White = Positive, Black = Negative
const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
]

function rollDie() {
    return Math.floor(Math.random() * 6) + 1
}

export default function Game() {
    const [blackHome, setBlackHome] = useState(0)
    const [whiteHome, setWhiteHome] = useState(0)
    const [blackBar, setBlackBar] = useState(0)
    const [whiteBar, setWhiteBar] = useState(0)
    const [board, setBoard] = useState(() => [...DEFAULT_BOARD])
    const [dice, setDice] = useState(() => [rollDie(), rollDie()])

    // TODO: Validate moves against dice
    const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextBoard = [...board];
        if (from == "white") { // white re-enter
            if (board[to] == -1) { // hit
                setBlackBar(bar => bar + 1)
                nextBoard[to] = 0
            }
            if (board[to] >= -1) { // move
                setWhiteBar(bar => bar - 1)
                nextBoard[to]++
            }
        } else if (from == 'black') { // black re-enter
            if (board[to] == 1) { // hit
                setWhiteBar(bar => bar + 1)
                nextBoard[to] = 0
            }
            if (board[to] <= 1) { // move
                setBlackBar(bar => bar - 1)
                nextBoard[to]--
            }
        } else {
            const offense = board[from];
            const defense = board[to];

            if (defense === undefined) {  // bear off
                if (offense > 0) {
                    setWhiteHome(count => count + 1)
                } else {
                    setBlackHome(count => count + 1)
                }
            } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
                nextBoard[to] += Math.sign(offense)
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

        setBoard([...nextBoard]);
    }, [board])

    const roll = useCallback(() => {
        setDice([rollDie(), rollDie()])
    }, [])

    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, -1,)
    }, [move])

    return <div id="board">
        <Toolbar />
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