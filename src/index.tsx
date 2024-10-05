import { StrictMode, useEffect, useState, useCallback, type DragEventHandler } from "react";
import ReactDOM from 'react-dom/client'
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
// TODO: Upgrade to modular after firebaseui upgrades
// import { initializeApp } from 'firebase/app';
import type { Match, Move, GameType, SnapshotOrNullType, UserData, ModalState } from "./Types";
import Friends from "./Friends";
import Chat from "./Chat";
import Profile from "./Profile";
import Login from "./Login";
import Dice from './Dice';
import Point from './Point';
import Piece from './Piece';
import './index.css'
import './Board.css';
import './Toolbar.css'
import { calculate, newGame, rollDie, vibrate } from './Utils';

// Start Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDSTc5VVNNT32jRE4m8qr7hVbI8ahaIsRc",
  authDomain: "peaceinthemiddleeast.firebaseapp.com",
  databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
  projectId: "peaceinthemiddleeast",
  storageBucket: "peaceinthemiddleeast.appspot.com",
  messagingSenderId: "529824094542",
  appId: "1:529824094542:web:eadc5cf0dc140a2b0de61f",
  measurementId: "G-NKGPNTLDF1"
});

// Start React
ReactDOM.createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

// React App
export function App() {
  const database = firebase.database();
  const [game, setGame] = useState<GameType>(newGame);
  const [user, setUser] = useState<SnapshotOrNullType>(null);
  const [state, setState] = useState<ModalState>(false);
  const [lastState, setLastState] = useState<ModalState>('friends');
  const [match, setMatch] = useState<Match | null>(null);
  const [chats, setChats] = useState<SnapshotOrNullType>(null);
  const [friend, setFriend] = useState<SnapshotOrNullType>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const toggle = useCallback((newState: ModalState) => {
    if (newState === true) {
      setState(prevState => {
        if (prevState) setLastState(prevState);
        return lastState;
      });
    } else if (newState === false) {
      setState(prevState => {
        if (prevState) setLastState(prevState);
        return false;
      });
    } else {
      setState(prevState => {
        if (prevState) setLastState(prevState);
        return newState
      });
    }
  }, [lastState]);

  const load = useCallback(async (userId?: string) => {
    console.log('Loading', userId);

    if (!user || !userId) {
      setMatch(null);
      setChats(null);
      setFriend(null);
      return;
    }

    window.history.pushState(null, '', `${userId}`);
    const userSnapshot = await database.ref(`users/${userId}`).get();
    if (!userSnapshot.exists()) {
      console.error('User not found', userId);
      return;
    }

    setFriend(userSnapshot);
    const matchSnapshot = await database.ref(`matches/${user.key}/${userId}`).get();
    if (!matchSnapshot.exists()) {
      // Create new match
      const gameRef = database.ref('games').push();
      const chatRef = database.ref('chats').push();
      // Point match to game
      const data: Match = {
        sort: new Date().toISOString(),
        game: gameRef.key!,
        chat: chatRef.key!,
      };
      database.ref(`matches/${user.key}/${userId}`).set(data);
      database.ref(`matches/${userId}/${user.key}`).set(data);
      setMatch(data);
    } else {
      setMatch(await matchSnapshot.val())
    }
    toggle(false);
  }, [user]);

  const reset = useCallback(() => {
    if (confirm('Are you sure you want to reset the match?')) {
      console.log('Resetting', match?.game);
      let data = newGame()
      if (match?.game)
        firebase.database().ref(`games/${match?.game}`).set(data);
      setGame(data);
    }
  }, [match?.game])


  // Autoload Match upon Login
  useEffect(() => {
    if (!user) return;

    const friendLocation = location.pathname.split('/').pop()
    if (friendLocation && friendLocation !== 'PeaceInTheMiddleEast') load(friendLocation);
  }, [load, user]);

  // onLogin/Logout
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async authUser => {
      if (authUser) {
        const userRef = firebase.database().ref(`users/${authUser.uid}`)
        let snapshot = await userRef.get()
        if (!snapshot.exists()) {
          // Upload initial user data
          const data: UserData = {
            uid: authUser.uid,
            name: authUser.displayName || authUser.uid,
            photoURL: authUser.photoURL,
            language: navigator.language,
          };
          console.log('Creating user', data);
          userRef.set(data);
        }
        userRef.on('value', setUser);
      } else {
        setUser(null);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  useEffect(() => {
    if (match?.game) {
      const gameRef = firebase.database().ref(`games/${match?.game}`)
      const onValue = (snapshot: firebase.database.DataSnapshot) => {
        const value = snapshot.val();
        if (value) {
          setGame(value);
        } else {
          const blankGame = newGame();
          setGame(blankGame);
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
    const newDice = [rollDie(), rollDie()];
    setGame(game => ({ ...game, dice: newDice }));
    const audio = new Audio('./shake-and-roll-dice-soundbible.mp3');
    audio.play();
    vibrate();
    if (match?.game)
      firebase.database().ref(`games/${match?.game}/dice`).set(newDice);
  }, [match?.game]);

  const move = useCallback((from: number | "white" | "black", to: number) => {
    const { state: nextState, moveLabel } = calculate(game, from, to);
    if (!moveLabel) return;
    setGame(nextState);
    // dispatch({ type: Actions.MOVE, data: { from, to } });
    // sendMove(nextState, `${nextState.dice.join("-")}: ${moveLabel}`);
    // const move = `${nextState.dice.join("-")}: ${moveLabel}`
    // };
    // const move = useCallback((game: GameType, move: Move["move"]) => {
    if (match?.game) {
      const time = new Date().toISOString();
      const nextMove: Move = {
        player: user?.val().uid,
        game: match.game,
        move: `${nextState.dice.join("-")}: ${moveLabel}`,
        time,
      }
      const update = {
        sort: time,
      };
      database.ref('moves').push(nextMove)
      database.ref(`games/${match.game}`).set(nextState)
      database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
      database.ref(`matches/${friend?.key}/${user?.key}`).update(update);

    }
  }, [game, match?.game, user, friend]);

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

  const renderFriend = friend ? <h2>{friend.val().name}</h2> : null;

  const toggleFriends = useCallback(() => { toggle(!state) }, [state])

  return (
    <>
      <dialog open={!!state}>
        {user
          ? state === 'friends'
            ? <Friends authUser={user} load={load} toggle={toggle} reset={reset} />
            : state === 'profile'
              ? <Profile authUser={user} toggle={toggle} />
              : state === 'chat'
                ? <Chat chats={chats} user={user} />
                : null
          : <Login />}
      </dialog>

      <div id="board">
        <div id="toolbar">
          <a className={`material-icons ${state && 'active' || ''}`} onClick={toggleFriends}>account_circle</a>
          {renderFriend}
        </div>

        <Dice onClick={rollDice} values={game.dice} />

        <div className="bar">
          {Array.from({ length: game.prison.white }, (_, index) =>
            <Piece key={index} position={-1} color="white" />
          )}
        </div>
        <div className="bar">
          {Array.from({ length: game.prison.black }, (_, index) =>
            <Piece key={index} position={-1} color="black" />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home.black }, (_, index) =>
            <Piece key={index} color="black" />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home.white }, (_, index) =>
            <Piece key={index} color="white" />
          )}
        </div>
        {game.board.map((pieces: number, index: number) =>
          <Point key={index} pieces={pieces} move={move} position={index} selected={selected} onSelect={onSelect} />
        )}
      </div >
    </>
  );
}