import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import Toolbar from '../Toolbar'
import { useCallback, useContext, useEffect, useState, type DragEventHandler } from 'react';
import { GameContext, MultiplayerContext } from '../Online/Contexts';
import firebase from 'firebase/compat/app';


// White = Positive, Black = Negative
const DEFAULT_BOARD = [
    5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2,
    -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2,
]

function rollDie() {
    return Math.floor(Math.random() * 6) + 1
}

function vibrate() {
    navigator.vibrate?.([50, 50, 60, 30, 90, 20, 110, 10, 150])
}

export default function Game() {
    const [blackHome, setBlackHome] = useState(0)
    const [whiteHome, setWhiteHome] = useState(0)
    const [blackBar, setBlackBar] = useState(0)
    const [whiteBar, setWhiteBar] = useState(0)
    const [board, setBoard] = useState(() => [...DEFAULT_BOARD])
    const [dice, setDice] = useState(() => [rollDie(), rollDie()])
    const [selected, setSelected] = useState<number|null>(null);
    const game = useContext(GameContext);
    const { move: sendMove } = useContext(MultiplayerContext);

    // Subscribe to Game
    useEffect(() => {
        if (game?.exists()) {
            setBoard(game.val().state)
            const subscriber = (snapshot: firebase.database.DataSnapshot) => {
                const value = snapshot.val()
                setBoard(value.state)
                if (value.dice)
                    setDice(oldDice => {
                        const newDice = value.dice.split('-').map(Number)
                        if (oldDice[0] === newDice[0] && oldDice[1] === newDice[1]) return oldDice;
                        vibrate()
                        return newDice;
                    })
            }
            game.ref.on('value', subscriber)
            return () => {
                game.ref.off('value', subscriber)
            }
        } else {
            setBoard([...DEFAULT_BOARD])
        }
    }, [game])

    const roll = useCallback(() => {
        vibrate()
        const newDice = [rollDie(), rollDie()]
        game?.ref.update({ dice: newDice.join('-') })
        setDice(newDice)
    }, [game])

    // TODO: Validate moves against dice
    const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextBoard = [...board];
        let moveLabel; // @see https://en.wikipedia.org/wiki/Backgammon_notation
        if (from == "white") { // white re-enter
            if (board[to] == -1) { // hit
                moveLabel = `bar/${to}*`
                setBlackBar(bar => bar + 1)
                setWhiteBar(bar => bar - 1)
                nextBoard[to] = 1
            } else if (board[to] >= -1) { // move
                moveLabel = `bar/${to}`
                setWhiteBar(bar => bar - 1)
                nextBoard[to]++
            } else { return; } // blocked
        } else if (from == 'black') { // black re-enter
            if (board[to] == 1) { // hit
                moveLabel = `bar/${to}*`
                setWhiteBar(bar => bar + 1)
                setBlackBar(bar => bar - 1)
                nextBoard[to] = -1
            } else if (board[to] <= 1) { // move
                moveLabel = `bar/${to}`
                setBlackBar(bar => bar - 1)
                nextBoard[to]--
            } else { return; } // blocked
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
                moveLabel = `${from}/${to}`
                nextBoard[to] += Math.sign(offense)
            } else if (Math.abs(defense) === 1) { // hit
                moveLabel = `${from}/${to}*`
                nextBoard[to] = -Math.sign(defense);
                if (offense > 0)
                    setBlackBar(bar => bar + 1)
                else
                    setWhiteBar(bar => bar + 1)
            } else { return; } // blocked

            nextBoard[from] -= Math.sign(offense)
        }

        setBoard(nextBoard);
        sendMove(nextBoard, moveLabel);
    }, [board, game, sendMove])

    const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
    const onDrop: DragEventHandler = useCallback((event) => {
        event.preventDefault();
        let from = parseInt(event.dataTransfer?.getData("text")!)
        return move(from, -1,)
    }, [move])
    const onSelect = useCallback((position: number | null) => {
        if (position === null || selected === position) {
            setSelected(null);
        } else if (selected === null) {
            setSelected(position);
        } else {
            move(selected, position);
            setSelected(null);
        }
    }, [selected, move])

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
        {board.map((pieces, index) => <Point key={index} pieces={pieces} move={move} position={index} selected={selected==index} onSelect={onSelect} />)}
    </div >;
}
