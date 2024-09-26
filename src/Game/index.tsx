import './Game.css';
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import Toolbar from '../Toolbar'
import { useCallback, useContext, useEffect, useState, type DragEventHandler } from 'react';
import { GameType, MatchContext, MultiplayerContext } from '../Online/Contexts';
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

const newGame = (oldGame?: GameType) => ({
    status: '',
    board: [...(oldGame?.board || DEFAULT_BOARD)],
    dice: oldGame?.dice || [6,6],
    prison: oldGame?.prison || {
        black: 0,
        white: 0,
    },
    home: oldGame?.home || {
        black: 0,
        white: 0,
    },
} as GameType)

export default function Game() {
    const database = firebase.database();
    const [game, setGame] = useState<GameType>(newGame);
    const [selected, setSelected] = useState<number|null>(null);
    const match = useContext(MatchContext);
    const { move: sendMove } = useContext(MultiplayerContext);

    // Subscribe to Game
    useEffect(() => {
        if (match?.game) {
            const subscriber = (snapshot: firebase.database.DataSnapshot) => {
                const value = snapshot.val()
                if (!value) return;
                setGame(value)
                // TODO: vibrate if enemy rolls?
            }
            database.ref(`games/${match.game}`).on('value', subscriber)
            return () => {
                database.ref(`games/${match.game}`).off('value', subscriber)
            }
        } else {
            setGame(newGame())
        }
    }, [match])

    const roll = useCallback(() => {
        vibrate()
        const newDice = [rollDie(), rollDie()]
        if (match?.game)
            database.ref(`games/${match.game}/dice`).set(newDice)
        setGame(game => ({...game, dice: newDice}))
    }, [match])

    // TODO: Validate moves against dice
    const move = useCallback((from: number | "white" | "black", to: number) => {
        if (from == to) return; // no move
        const nextGame: GameType = newGame(game);
        let moveLabel; // @see https://en.wikipedia.org/wiki/Backgammon_notation
        if (from == "white") { // white re-enter
            if (nextGame.board[to] == -1) { // hit
                moveLabel = `bar/${to}*`
                nextGame.prison!.black++
                nextGame.prison!.white--
                nextGame.board[to] = 1
            } else if (nextGame.board[to] >= -1) { // move
                moveLabel = `bar/${to}`
                nextGame.prison!.white--
                nextGame.board[to]++
            } else { return; } // blocked
        } else if (from == 'black') { // black re-enter
            if (nextGame.board[to] == 1) { // hit
                moveLabel = `bar/${to}*`
                nextGame.prison!.white++
                nextGame.prison!.black--
                nextGame.board[to] = -1
            } else if (nextGame.board[to] <= 1) { // move
                moveLabel = `bar/${to}`
                nextGame.prison!.black--
                nextGame.board[to]--
            } else { return; } // blocked
        } else {
            const offense = nextGame.board[from];
            const defense = nextGame.board[to];

            if (defense === undefined) {  // bear off
                moveLabel = `${from}/off`
                if (offense > 0) {
                    nextGame.home!.white++
                } else {
                    nextGame.home!.black++
                }
            } else if (!defense || Math.sign(defense) === Math.sign(offense)) { // move
                moveLabel = `${from}/${to}`
                nextGame.board[to] += Math.sign(offense)
            } else if (Math.abs(defense) === 1) { // hit
                moveLabel = `${from}/${to}*`
                nextGame.board[to] = -Math.sign(defense);
                if (offense > 0)
                    nextGame.prison!.black++
                else
                    nextGame.prison!.white++
            } else { return; } // blocked

            nextGame.board[from] -= Math.sign(offense)
        }

        setGame(nextGame);
        sendMove(nextGame, `${nextGame.dice.join('-')}: ${moveLabel}`);
    }, [game, sendMove])

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
        <Dice onClick={roll} values={game.dice} />

        <div className="bar">
            {Array.from({ length: game.prison.white }, (_, index) => <Piece key={index} position={-1} color="white" />)}
        </div>
        <div className="bar">
            {Array.from({ length: game.prison.black }, (_, index) => <Piece key={index} position={-1} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: game.home.black }, (_, index) => <Piece key={index} color="black" />)}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
            {Array.from({ length: game.home.white }, (_, index) => <Piece key={index} color="white" />)}
        </div>
        {game.board.map((pieces, index) => <Point key={index} pieces={pieces} move={move} position={index} selected={selected===index} onSelect={onSelect} />)}
    </div >;
}
