import Friends from "./Friends";
import Chat from "./Chat";
import Profile from "./Profile";
import Login from "./Login";
import { useContext, useEffect, useState, PropsWithChildren, useCallback, useMemo } from "react";
import { ModalContext, AuthContext, ChatContext, FriendContext, MatchContext, Match, GameType, MultiplayerContext, SnapshotOrNullType, UserData, ModalState, Move } from "./Contexts";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { newGame } from "../Game/useGameState";

/**
 * The rendered component tree
 */
export default () => {
    const { state } = useContext(ModalContext);
    const authUserSnapshot = useContext(AuthContext);
    if (state) {
        if (!authUserSnapshot) return <Login />;
        switch (state) {
            case 'chat': return <Chat />;
            case 'profile': return <Profile />;
            default: return <Friends />;
        }
    }
    return null;
}

/**
 * Context Provider for the Online tree
 */
export function Provider({ children }: PropsWithChildren) {
    const database = firebase.database();
    const [user, setUser] = useState<SnapshotOrNullType>(null);
    const [state, setState] = useState<ModalState>(false);
    const [lastState, setLastState] = useState<ModalState>('friends');
    const [match, setMatch] = useState<Match | null>(null);
    const [chats, setChats] = useState<SnapshotOrNullType>(null);
    const [friend, setFriend] = useState<SnapshotOrNullType>(null);

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

    const chat = useCallback((message: string) => {
        if (match && user) {
            database.ref(`chats/${match.chat}`).push({
                message,
                author: user.key,
                time: new Date().toISOString()
            })
        }
    }, [match, user]);

    const move = useCallback((game: GameType, move: Move["move"]) => {
        if (match?.game) {
            const time = new Date().toISOString();
            const nextMove: Move = {
                player: user?.val().uid,
                game: match.game,
                move,
                time,
            }
            const update = {
                sort: time,
            };
            database.ref('moves').push(nextMove)
            database.ref(`games/${match.game}`).update(game)
            database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
            database.ref(`matches/${friend?.key}/${user?.key}`).update(update);

        }
    }, [match, user, friend]);

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

    const reset = useCallback(async () => {
        if (match?.game) {
            if (confirm('Are you sure you want to reset the match?')) {
                console.log('Resetting', match.game);
                database.ref(`games/${match.game}`).set(newGame());
                // TODO: update state?
            }
        }
    }, [match]);

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


    return (
        <AuthContext.Provider value={user}>
            <ModalContext.Provider value={useMemo(() => ({ toggle, state }), [toggle, state])}>
                <MultiplayerContext.Provider value={useMemo(() => ({ load, move, chat, reset }), [load, move, chat, reset])}>
                    <FriendContext.Provider value={friend}>
                        <ChatContext.Provider value={chats}>
                            <MatchContext.Provider value={match}>
                                {children}
                            </MatchContext.Provider>
                        </ChatContext.Provider>
                    </FriendContext.Provider>
                </MultiplayerContext.Provider>
            </ModalContext.Provider>
        </AuthContext.Provider>
    );
}