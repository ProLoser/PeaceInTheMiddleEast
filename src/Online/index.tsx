import Friends from "./Friends";
import Chat from "./Chat";
import Profile from "./Profile";
import Login from "./Login";
import { useContext, useEffect, useState, PropsWithChildren, useCallback, useMemo } from "react";
import { ModalContext, AuthContext, ChatContext, FriendContext, GameContext, Match, MultiplayerContext, SnapshotOrNullType, UserData, ModalState } from "./Contexts";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

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
    const [game, setGame] = useState<SnapshotOrNullType>(null);
    const [chat, setChat] = useState<SnapshotOrNullType>(null);
    const [friend, setFriend] = useState<SnapshotOrNullType>(null);


    const toggle = (newState: ModalState) => {
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

    const send = useCallback((message: string) => {
        if (match && user) {
            database.ref(`chats/${match.chat}`).push({
                message,
                author: user.key
            })
        }
    }, [match, user]);

    const move = useCallback((nextBoard: number[], move: string) => {
        if (game?.key) {
            game.ref.child('moves').push({
                player: user?.val().uid,
                move
            })
            game.ref.update({ state: nextBoard })
            const update = {
                sort: new Date().toISOString(),
            };
            database.ref(`matches/${user?.key}/${friend?.key}`).update(update);
            database.ref(`matches/${friend?.key}/${user?.key}`).update(update);

        }
    }, [game, user, friend]);
    const load = useCallback(async (userId?: string) => {
        console.log('Loading', userId);

        if (!user || !userId) {
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

    useEffect(() => {
        if (!user) return;

        const friendLocation = location.pathname.split('/').pop()
        if (friendLocation && friendLocation !== 'PeaceInTheMiddleEast') load(friendLocation);
    }, [load, user]);

    // Synchronize Selected Match
    useEffect(() => {
        if (!user || !match) return;
        database.ref(`games/${match.game}`).get().then(setGame);
        database.ref(`chats/${match.chat}`).orderByKey().limitToLast(1000).on('value', setChat);

        return () => {
            database.ref(`chats/${match.chat}`).off('value', setChat);
        }
    }, [user, match]);


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
            <ModalContext.Provider value={{ toggle, state }}>
                <MultiplayerContext.Provider value={{ load, move }}>
                    <FriendContext.Provider value={friend}>
                        <ChatContext.Provider value={{ send, state:chat }}>
                            <GameContext.Provider value={game}>
                                {children}
                            </GameContext.Provider>
                        </ChatContext.Provider>
                    </FriendContext.Provider>
                </MultiplayerContext.Provider>
            </ModalContext.Provider>
        </AuthContext.Provider>
    );
}