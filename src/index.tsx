import { StrictMode, useEffect, useState, useCallback, type DragEventHandler } from "react";
import ReactDOM from 'react-dom/client'
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
// TODO: Upgrade to modular after firebaseui upgrades
// import { initializeApp } from 'firebase/app';
import type { Match, Move, GameType, SnapshotOrNullType, UserData, ModalState } from "./Types";
import Avatar from "./Avatar";
import Friends from "./Dialogues/Friends";
import Chat from "./Dialogues/Chat";
import Profile from "./Dialogues/Profile";
import Login from "./Dialogues/Login";
import Dice from './Board/Dice';
import Point from './Board/Point';
import Piece from './Board/Piece';
import './index.css'
import './Board/Board.css';
import './Toolbar.css'
import { calculate, newGame, rollDie, vibrate, calculateNewMove } from './Utils'; // Import calculateNewMove
import { registerSW } from 'virtual:pwa-register';



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

const diceSound = new Audio('./shake-and-roll-dice-soundbible.mp3');

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
    setState(prevState => {
      if (typeof newState === 'string') { // Open
        if (prevState) setLastState(prevState);
        return newState
      } else if (newState == true) { // Back
        setLastState(lastState => {
          newState = lastState;
          return prevState;
        });
        return newState;
      } else if (newState === false) { // Close
        if (prevState) setLastState(prevState);
        return false;
      } else { // Toggle
        setLastState(prevState);
        return prevState === 'friends' ? false : 'friends';
      }
    });
  }, []);

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

    const friendSnapshot = await database.ref(`users/${friendId}`).get();
    if (!friendSnapshot.exists()) {
      console.error('User not found', friendId);
      return;
    }

    setFriend(friendSnapshot);
    if (!authUser) return;
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
    toggle(false)
  }, [toggle]);

  const reset = useCallback(() => {
    if (confirm('Are you sure you want to reset the match?')) {
      console.log('Resetting', match?.game);
      let data = newGame()
      if (match?.game)
        firebase.database().ref(`games/${match?.game}`).set(data);
      setGame(data);
      toggle(false)
    }
  }, [match?.game, toggle])


  useEffect(() => {
    // Autoload Match upon Login
    const friendId = location.pathname.split('/').pop()
    if (friendId) load(friendId)
    

    // onLogin/Logout
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async authUser => {
      if (authUser) {
        const userRef = firebase.database().ref(`users/${authUser.uid}`)
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

  // Subscribe to match
  useEffect(() => {
    if (match?.game) {
      const gameRef = firebase.database().ref(`games/${match?.game}`)
      const onValue = (snapshot: firebase.database.DataSnapshot) => {
        const value = snapshot.val();
        if (value) {
          setGame(game => {
            if (game.color && game.color !== value.color) {
              diceSound.play();
              vibrate();
            }
            return value
          });
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
    const dice = [rollDie(), rollDie()];
    if (match?.game) {
      // online
      if (game.turn === user?.val().uid)
        return console.log("You cannot roll the dice twice in a row.");

      firebase.database().ref(`games/${match?.game}`).update({
        dice,
        color: game.color === 'white' ? 'black' : 'white',
        turn: user?.val().uid,
        status: 'rolled'
      });
    } else {
      // local
      setGame({
        ...game,
        dice
      });
    }

    diceSound.play();
    vibrate();
  }, [match?.game, game, user]);

  // Modified move function
  const move = useCallback((from: number | "white" | "black", to: number | "off") => {
    let moveAttempt: { state: GameType; moveLabel?: string; } | null = null;

    for (const dieValue of game.dice) {
      if (dieValue === 0) { // Skip used die
        continue;
      }
      const result = calculateNewMove(game, from, to, dieValue);
      if (result.moveLabel) { // Valid move found with this dieValue
        moveAttempt = result;
        break; 
      }
    }

    if (moveAttempt && moveAttempt.moveLabel) {
      setGame(moveAttempt.state);
      // Firebase update logic using moveAttempt.state and moveAttempt.moveLabel
      if (match?.game) {
        const time = new Date().toISOString();
        // Using moveAttempt.moveLabel directly as per prompt's current suggestion
        const nextMove: Move = {
          player: user?.val().uid,
          game: match.game,
          move: moveAttempt.moveLabel, // Simplified move string for now
          time,
        };
        const update = {
          sort: time,
        };
        database.ref('moves').push(nextMove);
        database.ref(`games/${match.game}`).set(moveAttempt.state); // Use the state from moveAttempt
        database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
        database.ref(`matches/${friend?.key}/${user?.key}`).update(update);
      }
    } else {
      console.log("Invalid move: No suitable die or move is illegal.", from, to);
      // Return without updating state or Firebase if no valid move was found
      return;
    }
  }, [game, match?.game, user, friend]);

  const onDragOver: DragEventHandler = useCallback((event) => { event.preventDefault(); }, [])
  // Modified onDrop handler
  const onDrop: DragEventHandler = useCallback((event) => {
    event.preventDefault();
    let from = parseInt(event.dataTransfer?.getData("text")!)
    // Call move with 'off' for bearing off
    return move(from, 'off');
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

  const friendData = friend?.val();

  return (
    <>
      <dialog open={(friendData&&!user)||!!state}>
        {user
          ? state === 'friends'
            ? <Friends authUser={user} load={load} toggle={toggle} reset={reset} />
            : state === 'profile'
              ? <Profile authUser={user} toggle={toggle} />
              : state === 'chat'
                ? <Chat chats={chats} user={user} />
                : null
          : <Login reset={reset} friend={friendData} load={load} />}
      </dialog>

      <div id="board">
        <div id="toolbar" onPointerUp={toggle}>
          {friendData
            ? <Avatar user={friendData} />
            : <a className={`material-icons ${state && 'active' || ''}`}>account_circle</a>}
          <h2>{friendData?.name ?? 'Local'}</h2>
        </div>

        <Dice onPointerUp={rollDice} values={game.dice} color={game.color} />

        <div className="bar">
          {Array.from({ length: game.prison?.white }, (_, index) =>
            <Piece key={index} position={-1} color="white" />
          )}
        </div>
        <div className="bar">
          {Array.from({ length: game.prison?.black }, (_, index) =>
            <Piece key={index} position={-1} color="black" />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home?.black }, (_, index) =>
            <Piece key={index} color="black" />
          )}
        </div>
        <div className="home" onDragOver={onDragOver} onDrop={onDrop}>
          {Array.from({ length: game.home?.white }, (_, index) =>
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
