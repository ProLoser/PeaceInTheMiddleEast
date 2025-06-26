import { StrictMode, useEffect, useState, useCallback, type DragEventHandler, useMemo } from "react";
import ReactDOM from 'react-dom/client'
// TODO: Upgrade to modular after firebaseui upgrades
// import { initializeApp } from 'firebase/app';
import type { Match, Move, GameType, SnapshotOrNullType, UserData, UsedDie } from "./Types";
import { Color, Status } from './Types';
import Dialogues from './Dialogues';
import Dice from './Board/Dice';
import Point from './Board/Point';
import Piece from './Board/Piece';
import Toolbar from './Board/Toolbar';
import './index.css'
import './Board/Board.css';
import './Board/Toolbar.css'
import { calculate, newGame, nextMoves, populated, rollDie, vibrate } from './Utils';
import firebase, { saveFcmToken } from "./firebase.config";
import { playCheckerSound } from './Utils';
import type firebaseType from 'firebase/compat/app';

// Start React
ReactDOM.createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

const diceSound = new Audio('./shake-and-roll-dice-soundbible.mp3');

// React App
export function App() {
  const database = firebase.database();
  const [game, setGame] = useState<GameType>(newGame);
  const [user, setUser] = useState<SnapshotOrNullType>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [chats, setChats] = useState<SnapshotOrNullType>(null);
  const [friend, setFriend] = useState<SnapshotOrNullType>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [usedDice, setUsedDice] = useState<UsedDie[]>([]);

  const load = useCallback(async (friendId: string = '', authUser?: string) => {
    if (friendId === 'PeaceInTheMiddleEast') return;
    console.log('Loading', friendId);

    // Update URL
    if (window.location.pathname !== `/${friendId}`) {
      window.history.pushState(null, '', `/${friendId}`);
    }

    if (!friendId) {
      setMatch(null);
      setChats(null);
      setFriend(null);
      return;
    }

    if (!authUser) {
      console.error('Cannot load friend without being authenticated');
      return;
    }

    const friendSnapshot = await database.ref(`users/${friendId}`).get();
    if (!friendSnapshot.exists()) {
      console.error('User not found', friendId);
      return;
    }

    setFriend(friendSnapshot);
    const matchSnapshot = await database.ref(`matches/${authUser}/${friendId}`).get();
    if (matchSnapshot.exists()) {
      setMatch(await matchSnapshot.val());
    } else {
      // Create new match
      const gameRef = database.ref('games').push();
      const chatRef = database.ref('chats').push();
      // Point match to game
      const data: Match = {
        sort: new Date().toISOString(),
        game: gameRef.key!,
        chat: chatRef.key!,
      };
      database.ref(`matches/${authUser}/${friendId}`).set(data);
      database.ref(`matches/${friendId}/${authUser}`).set(data);
      setMatch(data);
    }
  }, [database]);

  const reset = useCallback(() => {
    if (confirm('Are you sure you want to reset the match?')) {
      console.log('Resetting', match?.game);
      let data = newGame()
      if (match?.game)
        database.ref(`games/${match?.game}`).set(data);
      setGame(data);
      setUsedDice([]);
      setSelected(null);
    }
  }, [match?.game, database]);

  useEffect(() => {
    // Autoload Match upon Login
    const friendId = location.pathname.split('/').pop()
    if (friendId) load(friendId)
    
    // onLogin/Logout
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async authUser => {
      if (authUser) {
        const userRef = database.ref(`users/${authUser.uid}`)
        let snapshot = await userRef.get()
        if (!snapshot.exists()) {
          // Upload initial user data
          const data: UserData = {
            uid: authUser.uid,
            name: authUser.displayName || authUser.uid,
            search: (authUser.displayName || authUser.uid).toLocaleLowerCase(),
            photoURL: authUser.photoURL,
            language: navigator.language,
          };
          console.log('Creating user', data);
          userRef.set(data);
          saveFcmToken();
        }
        userRef.on('value', user => {
          setUser(user);
          if (friendId) load(friendId, authUser.uid)
        });
      } else {
        setUser(null);
        setMatch(null);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  const moves = useMemo(() => {
    if (game.turn && (game.turn !== user?.val().uid || game.status !== Status.Moving))
      return new Set();
    return nextMoves(game, usedDice, selected!)
  }, [selected, game, usedDice])

  // Subscribe to match
  useEffect(() => {
    if (match?.game) {
      const gameRef = database.ref(`games/${match?.game}`)
      const onValue = (snapshot: firebaseType.database.DataSnapshot) => {
        const value = snapshot.val();
        if (value) {
          setGame(game => {
            if (game.color && game.color !== value.color) {
              diceSound.play();
              vibrate();
              setUsedDice([]);
            }
            return value
          });
        } else {
          const blankGame = newGame();
          setGame(blankGame);
          setUsedDice([]);
          // TODO: do i need to set this?
          gameRef.set(blankGame);
        }
      };
      gameRef.on("value", onValue);
      return () => {
        gameRef.off("value", onValue);
      };
    }
  }, [match?.game]);

  const rollDice = useCallback(() => {
    const dice = [rollDie(), rollDie()] as GameType['dice'];
    if (dice[0] === dice[1]) dice.push(dice[0], dice[0]); // doubles
    if (match?.game) {
      // online
      if (game.turn === user?.val().uid)
        return console.log("You cannot roll the dice twice in a row.");

      database.ref(`games/${match?.game}`).update({
        dice,
        color: game.color === Color.White ? Color.Black : Color.White,
        turn: user?.val().uid,
        status: Status.Moving
      });
    } else {
      // local
      setGame({
        ...game,
        dice,
        status: Status.Moving
      });
    }

    setUsedDice([]);
    setSelected(null);
    diceSound.play();
    vibrate();
  }, [match?.game, game, user]);

  const move = useCallback((from: number | Color, to: number) => {
    if (match?.game && (!moves.has(to) || game.status !== Status.Moving)) return;
    const { state: nextState, moveLabel, usedDie } = calculate(game, from, to);
    if (!moveLabel) return;
    navigator.vibrate?.(10);
    playCheckerSound();
    setGame(nextState);
    setUsedDice(prev => [...prev, { 
      value: usedDie!,
      label: moveLabel 
    }]);
  }, [game, match?.game, user, friend, moves]);

  // Publish move after all dice are used
  useEffect(() => {
    if (usedDice.length === game.dice.length && match?.game) {
      const time = new Date().toISOString();
      const moveLabels = usedDice.map(die => die.label).join(' ');
      const nextMove: Move = {
        player: user?.val().uid,
        move: `${game.dice.join("-")}: ${moveLabels}`,
        time,
        friend: friend?.key!,
      }
      const update = {
        sort: time,
      };
      game.status = Status.Rolling;
      database.ref('moves').push(nextMove)
      database.ref(`games/${match.game}`).set(game)
      database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
      database.ref(`matches/${friend?.key}/${user?.key}`).update(update);
    }
  }, [usedDice, game, match?.game, friend, user]);

  const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
  const onDrop: DragEventHandler = useCallback((event) => {
    event.preventDefault();
    let from = parseInt(event.dataTransfer?.getData("text")!)
    move(from, -1)
  }, [move])

  const onSelect = useCallback((position: number | null) => {
    setSelected(position)
  }, [selected]) // this dependency is necessary for some reason

  const friendData = friend?.val();

  // Helper to check if it's the current player's turn
  const isMyTurn = useMemo(() => {
    // If local game (no match), allow all moves
    if (!match?.game) return true;
    // If user or game.turn is not set, disallow
    if (!user?.val?.() || !game.turn) return false;
    return user.val().uid === game.turn;
  }, [match?.game, user, game.turn]);

  return (
    <Dialogues
      user={user}
      friendData={friendData}
      load={load}
      reset={reset}
      chats={chats}
    >
      <div id="board">
        <Toolbar friendData={friend} />
        <Dice
          onPointerUp={rollDice}
          values={game.dice}
          color={game.color}
          used={usedDice}
        />
        <div className="bar">
          {Array.from({ length: game.prison?.white }, (_, index) =>
            <Piece
              key={index}
              position={-1}
              color={Color.White}
              enabled={isMyTurn && (!game.color || game.color === Color.White)}
            />
          )}
        </div>
        <div className="bar">
          {Array.from({ length: game.prison?.black }, (_, index) =>
            <Piece
              key={index}
              position={-1}
              color={Color.Black}
              enabled={isMyTurn && (!game.color || game.color === Color.Black)}
            />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home?.black }, (_, index) =>
            <Piece key={index} color={Color.Black} />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home?.white }, (_, index) =>
            <Piece key={index} color={Color.White} />
          )}
        </div>
        {game.board.map((pieces: number, index: number) =>
          <Point
            enabled={isMyTurn && (!game.color && pieces !== 0 || populated(game.color, pieces))}
            valid={moves.has(index)}
            key={index}
            pieces={pieces}
            move={move}
            position={index}
            selected={selected}
            onSelect={onSelect}
          />
        )}
      </div>
    </Dialogues>
  );
}
