// Sentry initialization should be imported first!
import "./instrument";
import './i18n';
import { StrictMode, useEffect, useState, useCallback, useMemo, type DragEventHandler, useRef } from "react";
import ReactDOM from 'react-dom/client'
// TODO: Upgrade to modular after firebaseui upgrades
// import { initializeApp } from 'firebase/app';
import type { Match, Move, Game, SnapshotOrNullType, User, UsedDie } from "./Types";
import { Color, Status } from './Types';
import Dialogues from './Dialogues';
import Dice from './Board/Dice';
import Point from './Board/Point';
import Piece from './Board/Piece';
import Toolbar from './Board/Toolbar';
import './index.css'
import './Board/Board.css';
import './Board/Toolbar.css'
import { calculate, newGame, nextMoves, rollDie, Vibrations, playAudio, classes, parseUsed, parseMove } from './Utils';
import firebase from "./firebase.config";
import { playCheckerSound } from './Utils';
import type firebaseType from 'firebase/compat/app';
import * as Sentry from "@sentry/react";
import { useTranslation } from 'react-i18next';

import { Suspense } from "react";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback="loading">
      <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
        <App />
      </Sentry.ErrorBoundary>
    </Suspense>
  </StrictMode>
);

const diceSound = new Audio('./shake-and-roll-dice-soundbible.mp3');

export function App() {
  const { t } = useTranslation();
  const [game, setGame] = useState<Game>(newGame);
  const [user, setUser] = useState<SnapshotOrNullType>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [chats, setChats] = useState<SnapshotOrNullType>(null);
  const [friend, setFriend] = useState<SnapshotOrNullType>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [usedDice, setUsedDice] = useState<UsedDie[]>([]);
  const hadMatchRef = useRef(false);
  const gameSnapshotRef = useRef<SnapshotOrNullType>(null);

  const load = useCallback(async (friendId?: string | false, authUserUid?: string) => {
    if (friendId === 'PeaceInTheMiddleEast' || friendId === '__') return;
    console.log('Loading', friendId, 'with authUserUid:', authUserUid);
    
    setSelected(null)
    setUsedDice([])
    
    if (!friendId) {
      // Offline match - preserve current game state
      setFriend(null);
      setMatch(null);
      setChats(null);
      if (window.location.pathname !== `/`) {
        window.history.pushState(null, '', `/`);
      }
      return;
    }

    // Online match - load friend and match data
    const database = firebase.database();

    const friendSnapshot = await database.ref(`users/${friendId}`).get();
    if (!friendSnapshot.exists()) {
      console.error('User not found', friendId);
      setFriend(null);
      setMatch(null);
      setChats(null);
      if (window.location.pathname !== `/`) {
        window.history.pushState(null, '', `/`);
      }
      return;
    }
    
    // Friend exists - now update URL and state
    setFriend(friendSnapshot);
    setGame(newGame());
    if (window.location.pathname !== `/${friendId}`) {
      window.history.pushState(null, '', `/${friendId}`);
    }

    if (!authUserUid) {
      setMatch(null);
      setChats(null);
      console.log('User not authenticated, only loaded friend details.');
      return;
    }

    const matchSnapshot = await database.ref(`matches/${authUserUid}/${friendId}`).get();
    if (matchSnapshot.exists()) {
      setMatch(await matchSnapshot.val());
    } else { // Create new match
      const gameRef = database.ref('games').push();
      const chatRef = database.ref('chats').push();
      const data: Match = {
        sort: new Date().toISOString(),
        game: gameRef.key!,
        chat: chatRef.key!,
      };
      database.ref(`matches/${authUserUid}/${friendId}`).set(data);
      database.ref(`matches/${friendId}/${authUserUid}`).set(data);
      setMatch(data);
    }
  }, []);

  const reset = useCallback(() => {
    if (confirm(t('resetConfirm'))) {
      console.log('Resetting', match?.game);
      const data = newGame()
      if (match)
        firebase.database().ref(`games/${match.game}`).set(data);
      setGame(data);
      setUsedDice([]);
      setSelected(null);
    }
  }, [match, t]);

  const isMyTurn = useMemo<boolean>(() => 
    !match 
      || !game.turn 
      || !!user?.key 
      && user.key === game.turn
  , [match, user, game.turn]);

  const rollDice = useCallback(() => {
    const dice = [rollDie(), rollDie()] as Game['dice'];
    if (dice[0] === dice[1]) dice.push(dice[0], dice[0]); // doubles
    if (match && user && friend) { // online
      if (!isMyTurn) return;
      if (game.status !== Status.Rolling) {
        if (gameSnapshotRef.current && usedDice.length > 0 && usedDice.length < game.dice.length) {
          setGame(gameSnapshotRef.current.val());
          setUsedDice([]);
          setSelected(null);
        }
        return;
      }

      const database = firebase.database();
      database.ref(`games/${match.game}`).update({
        dice,
        color: game.color === Color.White ? Color.Black : Color.White,
        turn: user.key,
        status: Status.Moving
      });
      database.ref(`matches/${user.key}/${friend.key}`).update({ turn: user.key });
      database.ref(`matches/${friend.key}/${user.key}`).update({ turn: user.key });
    } else { // local
      setGame({
        ...game,
        dice,
        status: Status.Moving
      });
    }

    playAudio(diceSound);
    navigator.vibrate?.(Vibrations.Dice);
    setUsedDice([]);
    setSelected(null);
    // TODO: autoselect bar, but game.color is not set yet
    // setSelected(match && game.color && game.prison[game.color] ? -1 : null);
  }, [match, game, isMyTurn, user, friend, usedDice]);

  const moves = useMemo(() => {
    if (!isMyTurn || game.status !== Status.Moving)
      return new Set();
    return nextMoves(game, usedDice, selected!)
  }, [game, isMyTurn, usedDice, selected])

  const sources = useMemo(() => {
    if (!isMyTurn || game.status !== Status.Moving)
      return new Set();
    return nextMoves(game, usedDice)
  }, [game, isMyTurn, usedDice])

  const lastMove = useMemo(() => {
    if (!game.color) return { ghosts: {}, moved: {}, ghostHit: {} };
    if (usedDice.length > 0) return parseUsed(usedDice, game.color);
    if (game.status === Status.Rolling) return parseMove(game.lastMove, game.color);
    return { ghosts: {}, moved: {}, ghostHit: {} };
  }, [usedDice, game])

  const move = useCallback((from: number | Color, to: number) => {
    if (match && (!moves.has(to) || game.status !== Status.Moving)) return;
    const { state: nextState, moveLabel, usedDie } = calculate(game, from, to, usedDice)
    if (!moveLabel) return; // invalid
    playCheckerSound()
    navigator.vibrate?.(Vibrations.Down)
    setGame(nextState)
    setSelected(null)
    if (!match) return;
    setUsedDice(prev => {
      const newUsedDice = [...prev, { value: usedDie!, label: moveLabel }];
      // If the game ended, publish the game state immediately
      if (nextState.status === Status.GameOver) {
        const time = new Date().toISOString();
        const moveLabels = newUsedDice.map(die => die.label).join(' ');
        const moveString = `${nextState.dice.join("-")}: ${moveLabels} (game over)`;
        const nextMove: Move = {
          player: user?.key as User['uid'],
          move: moveString,
          time,
          friend: friend?.key as User['uid'],
        };
        const update = {
          sort: time,
          turn: true, // Game is over
        };
        const nextGameWithMove = {
          ...nextState,
          lastMove: moveString
        };
        const database = firebase.database();
        database.ref('moves').push(nextMove);
        database.ref(`games/${match.game}`).set(nextGameWithMove);
        database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
        database.ref(`matches/${friend?.key}/${user?.key}`).update(update);
        return [];
      }
      return newUsedDice;
    });
  }, [game, match, moves, usedDice, user, friend]);

  const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
  
  const onDrop: DragEventHandler = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      const from = parseInt(event.dataTransfer.getData("text"))
      move(from, -1)
    }
  }, [move])

  const onSelect = useCallback((position: number | null) => {
    setSelected(position)
  }, [])

  const onHomeClick = useCallback(() => {
    if (selected !== null) {
      move(selected, -1);
    }
  }, [selected, move]);

  const onBarDragStart: DragEventHandler = useCallback((event) => {
    setSelected(-1);
    navigator.vibrate?.(Vibrations.Up);
    event.dataTransfer?.setData('text', '-1');
  }, []);

  const onBarDragEnd = useCallback(() => {
    setSelected(null);
  }, []);

  const onBarPointerUp = useCallback(() => {
    if (selected === -1) {
      setSelected(null);
    } else {
      navigator.vibrate?.(Vibrations.Up);
      setSelected(-1);
    }
  }, [selected]);

  const friendData: User | undefined = useMemo(() => friend?.val(), [friend])

  useEffect(() => { // PopState observer (browser history navigation)
    // https://backgammon.family/__/auth/handler?apiKey=
    if (location.href.includes('__/auth/handler')) return;
    const onPopState = () => {
      load(
        location.pathname.split('/')[1],
        user?.key || undefined
      )
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [load, user]);

  useEffect(() => { // auth observer
    const friendId = location.pathname.split('/')[1]

    let unsubscribeUser: (() => void) | null;
    let previousUserKey: string | null = null;

    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async authUser => {
      if (authUser) { // User is signed in
        const userRef = firebase.database().ref(`users/${authUser.uid}`);
        const snapshot = await userRef.get();
        if (!snapshot.exists()) { // Upload initial user data
          const data: User = {
            uid: authUser.uid,
            name: authUser.displayName || authUser.uid,
            search: (authUser.displayName || authUser.uid).toLocaleLowerCase(),
            photoURL: authUser.photoURL,
            language: navigator.language,
          };
          console.log('Creating user', data);
          userRef.set(data);
        }

        // Subscribe to user data changes
        const onUserValue = (userSnapshot: SnapshotOrNullType) => {
          setUser(userSnapshot);
          const currentUserKey = userSnapshot?.key;
          if (previousUserKey !== currentUserKey) {
            previousUserKey = currentUserKey || null;
            load(friendId, authUser.uid);
          }
        }
        userRef.on('value', onUserValue);
        unsubscribeUser = () => {
          userRef.off('value', onUserValue)
          unsubscribeUser = null
        }
      } else { // User is signed out
        setUser(null);
        setMatch(null);
        load(friendId);
      }
    });
    return () => {
      unregisterAuthObserver();
      unsubscribeUser?.()
    };
  }, [load]);

  useEffect(() => { // match observer
    if (match) {
      hadMatchRef.current = true;
      const gameRef = firebase.database().ref(`games/${match.game}`);
      const onValue = (snapshot: firebaseType.database.DataSnapshot) => {
        gameSnapshotRef.current = snapshot
        const nextGame = snapshot.val();
        if (nextGame) {
          setGame(prevGame => {
            if (prevGame.color && prevGame.color !== nextGame.color) {
              playAudio(diceSound);
              navigator.vibrate?.(Vibrations.Dice)
              setUsedDice([])
              setSelected(null)
            }
            if (
              user?.key &&
              prevGame.turn !== nextGame.turn &&
              nextGame.turn === user.key
            ) {
              playCheckerSound();
            }
            return nextGame;
          });
        } else {
          const blankGame = newGame();
          setGame(blankGame);
          setUsedDice([]);
          setSelected(null);
          gameRef.set(blankGame);
        }
      };
      gameRef.on("value", onValue);
      return () => {
        gameRef.off("value", onValue);
      };
    } else {
      setSelected(null);
      if (hadMatchRef.current) {
        setGame(newGame());
        setUsedDice([]);
        hadMatchRef.current = false;
      }
    }
  }, [match, user]);

  useEffect(() => { // usedDice observer to publish moves
    if (
      match
      && user 
      && friend
      && isMyTurn
      && game.status === Status.Moving
      && game.dice?.length 
      && (
        usedDice.length === game.dice.length
        || (!moves.size && (selected === null || selected === -1))
      )
    ) {
      const time = new Date().toISOString();
      const moveLabels = usedDice.map(die => die.label).join(' ');
      const isBlocked = usedDice.length === 0 && !moves.size;
      const moveString = isBlocked 
        ? `${game.dice.join("-")}: blocked`
        : `${game.dice.join("-")}: ${moveLabels}`;
      const nextMove: Move = {
        player: user.key as User['uid'],
        move: moveString,
        time,
        friend: friend.key as User['uid'],
      }
      const update: Partial<Match> = {
        sort: time,
        turn: friend.key as User['uid']
      };
      const database = firebase.database();
      const nextGame = {
        ...game,
        status: Status.Rolling,
        turn: friend?.key,
        lastMove: moveString,
      }
      database.ref('moves').push(nextMove)
      database.ref(`games/${match.game}`).set(nextGame)
      database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
      database.ref(`matches/${friend?.key}/${user?.key}`).update(update);
      setUsedDice([])
    }
  }, [usedDice, game, match, friend, user, moves, selected, isMyTurn]);

  const winner = useMemo(() => {
    if (game.status !== Status.GameOver) return undefined;
    if (game.turn === user?.key) return user?.val();
    if (game.turn === friend?.key) return friend?.val();
    return undefined
  }, [game.status, game.turn, user, friend])

  const whiteBarDraggable = isMyTurn && (!game.color || game.color === Color.White) && game.prison?.white > 0;
  const blackBarDraggable = isMyTurn && (!game.color || game.color === Color.Black) && game.prison?.black > 0;

  return (
    <Dialogues
      user={user}
      friend={friendData}
      load={load}
      reset={reset}
      chats={chats}
      gameover={winner}
    >
      <div id="board" className={game.color}>
        <Toolbar friend={friendData} />
        <Dice
          onPointerUp={rollDice}
          values={game.dice}
          color={game.color}
          used={usedDice}
          disabled={!!game.turn && !isMyTurn}
          pulsate={isMyTurn && game.status === Status.Rolling}
          undo={!!match && isMyTurn && usedDice.length > 0 && usedDice.length < game.dice.length}
        />
        <div 
          className={classes('bar', { selected: selected === -1 })}
          draggable={whiteBarDraggable}
          onDragStart={onBarDragStart}
          onDragEnd={onBarDragEnd}
          onPointerUp={onBarPointerUp}
        >
          {Array.from({ length: game.prison?.white }, (_, index) =>
            <Piece
              key={index}
              color={Color.White}
            />
          )}
          {lastMove.ghosts[-1] > 0 ? Array.from({ length: lastMove.ghosts[-1] }, (_, index) => 
            <Piece key={`ghost-${index}`} color={Color.White} ghost />
          ): null}
        </div>
        <div 
          className={classes('bar', { selected: selected === -1 })}
          draggable={blackBarDraggable}
          onDragStart={onBarDragStart}
          onDragEnd={onBarDragEnd}
          onPointerUp={onBarPointerUp}
        >
          {Array.from({ length: game.prison?.black }, (_, index) =>
            <Piece
              key={index}
              color={Color.Black}
            />
          )}
          {lastMove.ghosts[-1] < 0 ? Array.from({ length: Math.abs(lastMove.ghosts[-1]) }, (_, index) => 
            <Piece key={`ghost-${index}`} color={Color.Black} ghost />
          ): null}
        </div>
        <div className={classes('home', { valid: typeof selected === 'number' && moves.has(-1) })} 
          onDragOver={onDragOver} 
          onDrop={onDrop} 
          onPointerUp={onHomeClick}>
          {Array.from({ length: game.home?.black }, (_, index) =>
            <Piece key={index} color={Color.Black} />
          )}
        </div>
        <div className={classes('home', { valid: typeof selected === 'number' && moves.has(-1) })} 
          onDragOver={onDragOver} 
          onDrop={onDrop} 
          onPointerUp={onHomeClick}>
          {Array.from({ length: game.home?.white }, (_, index) =>
            <Piece key={index} color={Color.White} />
          )}
        </div>
        {game.board.map((pieces: number, index: number) =>
          <Point
            enabled={!match || sources.has(index)}
            valid={moves.has(index)}
            key={index}
            pieces={pieces}
            move={move}
            position={index}
            selected={selected}
            onSelect={onSelect}
            ghosts={lastMove.ghosts[index]}
            ghostHit={lastMove.ghostHit[index]}
            moved={lastMove.moved[index]}
          />
        )}
      </div>
    </Dialogues>
  );
}
