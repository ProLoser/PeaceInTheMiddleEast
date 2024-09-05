import Friends from "./Friends";
import Chat from "./Chat";
import Profile from "./Profile";
import Login from "./Login";
import { useContext, useEffect, useState, PropsWithChildren, useCallback, useMemo } from "react";
import { SwitcherContext, AuthContext, ChatContext, FriendContext, GameContext, Match, MultiplayerContext, SnapshotContext, UserData, SwitcherState } from "./Contexts";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

/**
 * The rendered component tree
 */
export default () => {
    const { state } = useContext(SwitcherContext);
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
    return (
        <AuthProvider>
            <OnlineProvider>
                <MultiplayerProvider>
                    {children}
                </MultiplayerProvider>
            </OnlineProvider>
        </AuthProvider>
    );
}

// Provider component for the auth context
/**
 * @todo merge providers
 */
export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<firebase.database.DataSnapshot | null>(null);

    useEffect(() => {
        // onAuthStateChanged
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
                    snapshot = await userRef.get()
                }
                setUser(snapshot);
            } else {
                setUser(null);
            }
        });
        return () => unregisterAuthObserver();
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * @todo merge providers into one
 */
export const OnlineProvider = ({ children }: PropsWithChildren) => {
    const [state, setState] = useState<SwitcherState>(false);
    const [lastState, setLastState] = useState<SwitcherState>('friends');

    const toggle = (newState: SwitcherState) => {
        if (newState === true) {
            setState(lastState);
        } else if (newState === false) {
            setState(prevState => {
                if (prevState)
                    setLastState(prevState);
                return false;
            });
        } else {
            setState(newState);
        }
    };

    const context = useMemo(() => ({ toggle, state }), [state]);

    return (
        <SwitcherContext.Provider value={context}>
            {children}
        </SwitcherContext.Provider>
    );
}

/**
 * @todo merge providers into one
 * @todo update match when 
 */
export const MultiplayerProvider = ({ children }: PropsWithChildren) => {

    const database = firebase.database();

    const [match, setMatch] = useState<Match | null>(null);
    const [game, setGame] = useState<SnapshotContext>(null);
    const [chat, setChat] = useState<SnapshotContext>(null);
    const [friend, setFriend] = useState<SnapshotContext>(null);
    const authUser = useContext(AuthContext); // Local signed-in state.
    const move = useCallback((nextBoard: number[], move: string) => {
        if (game?.key) {
            game.ref.child('moves').push({
                player: authUser?.val().uid,
                move
            })
            game.ref.update({ state: nextBoard })
            const update = {
                sort: new Date().toISOString(),
            };
            database.ref(`matches/${authUser?.key}/${friend?.key}`).update(update);
            database.ref(`matches/${friend?.key}/${authUser?.key}`).update(update);

        }
    }, [game, authUser, database, friend]);
    const load = useCallback(async (userId?: string) => {
        console.log('Loading', userId);

        if (!authUser || !userId) {
            setGame(null);
            setChat(null);
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
        const matchSnapshot = await database.ref(`matches/${authUser.key}/${userId}`).get();
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
            database.ref(`matches/${authUser.key}/${userId}`).set(data);
            database.ref(`matches/${userId}/${authUser.key}`).set(data);
            setMatch(data);
        } else {
            setMatch(await matchSnapshot.val())
        }
    }, [authUser, database]);

    useEffect(() => {
        if (!authUser) return;

        const friendLocation = location.pathname.split('/').pop()
        if (friendLocation && friendLocation !== 'PeaceInTheMiddleEast') load(friendLocation);
    }, [load, authUser]);

    // Synchronize Selected Match
    useEffect(() => {
        if (!authUser || !match) return;
        database.ref(`games/${match.game}`).get().then(setGame);
        database.ref(`chats/${match.chat}`).orderByKey().limitToLast(1000).on('value', setChat);

        return () => {
            database.ref(`chats/${match.chat}`).off('value', setChat);
        }
    }, [authUser, match]);

    return (
        <MultiplayerContext.Provider value={{load,move}}>
            <FriendContext.Provider value={friend}>
                <ChatContext.Provider value={chat}>
                    <GameContext.Provider value={game}>
                        {children}
                    </GameContext.Provider>
                </ChatContext.Provider>
            </FriendContext.Provider>
        </MultiplayerContext.Provider>
    );
}