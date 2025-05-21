import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import Toolbar from '../Toolbar';
import { useCallback, useState, type DragEventHandler } from 'react';


// White = Positive, Black = Negative
const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
]
const DEFAULT_BOARD_WITH_GUTTERS = [
    5, 0, 0, 0, -3, 0,  0,   -5, 0, 0, 0, 0, 2,  -0
    -5, 0, 0, 0, 3, 0,  -0,   5, 0, 0, 0, 0, -2,  0
]

const DEFAULT_BOARD_WITH_GUTTERS1 = [
    // -off, -bar
    0, 0,
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
    0, 0
    // off, bar
]

function rollDie() {
    return Math.floor(Math.random() * 6) + 1
}

export default function Game() {
    const [invertColor, setInvertColor] = useState(false)
    const [blackHome, setBlackHome] = useState(0)
    const [whiteHome, setWhiteHome] = useState(0)
    const [blackBar, setBlackBar] = useState(0)
    const [whiteBar, setWhiteBar] = useState(0)
    const [board, setBoard] = useState(() => [...DEFAULT_BOARD])
    const [dice, setDice] = useState(() => [rollDie(), rollDie()])
    const [selected, setSelected] = useState<number|null>(null);

    const onSelect = useCallback((position:number|null) => {
        if (position === null || selected === position) {
            setSelected(null);
        } else if (selected === null) {
            setSelected(position);
        } else {
            move(selected, position);
            setSelected(null);
        }
    }, [selected])

    // TODO: Validate moves against dice
    const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextBoard = [...board];
        let moveLabel = '';
        if (from == "white") { // white re-enter
            moveLabel = `bar/${to}`
            if (board[to] == -1) { // hit
                setBlackBar(bar => bar + 1)
                nextBoard[to] = 0
                moveLabel += '*'
            }
            if (board[to] >= -1) { // move
                setWhiteBar(bar => bar - 1)
                nextBoard[to]++
            } else {
                return; // blocked
            }
        } else if (from == 'black') { // black re-enter
            moveLabel = `bar/${to}`
            if (board[to] == 1) { // hit
                setWhiteBar(bar => bar + 1)
                nextBoard[to] = 0
                moveLabel += '*'
            }
            if (board[to] <= 1) { // move
                setBlackBar(bar => bar - 1)
                nextBoard[to]--
            } else {
                return; // blocked
            }
        } else {
            const offense = board[from];
            const defense = board[to];

            if (defense === undefined) {  // bear off
                moveLabel = `${from}/off`
                if (offense > 0) {
                    setWhiteHome(count => count + 1)
                } else {
                    setBlackHome(count => count + 1)
                }
            } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
                nextBoard[to] += Math.sign(offense)
                moveLabel = `${from}/${to}`
            } else if (Math.abs(defense) === 1) { // hit
                nextBoard[to] = -Math.sign(defense);
                moveLabel = `${from}/${to}*`
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
        navigator.vibrate?.([50,50,60,30,90,20,110,10,150])
        setDice([rollDie(), rollDie()])
    }, [])

    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, -1,)
    }, [move])

    const color = (pieces: number) => pieces > 0 ? invertColor && 'black' || 'white' : invertColor && 'white' || 'black'

    return <div id="board">
        <Toolbar />
        <Dice onClick={roll} values={dice} />

        <div className="bar">
            {Array.from({ length: whiteBar }, (_, index) => <Piece key={index} position={-1} color={invertColor?'black':'white'} />)}
        </div>
        <div className="bar">
            {Array.from({ length: blackBar }, (_, index) => <Piece key={index} position={-1} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: blackHome }, (_, index) => <Piece key={index} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: whiteHome }, (_, index) => <Piece key={index} color={invertColor?'black':'white'} />)}
        </div>
        {/* {board.map((pieces, index) => <Point key={index} pieces={pieces} move={move} position={index} selected={selected==index} onSelect={onSelect} />)} */}
        {board.map((pieces, position) =>
            <Point key={position} move={move} position={position} selected={selected==position} onSelect={onSelect}>
                {Array.from({ length: Math.abs(pieces) }, (_, index) => <Piece key={index} color={color(pieces)} position={position} onSelect={onSelect} />)}
            </Point>
        )}
    </div >;
}
