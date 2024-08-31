import { createContext, useContext, useEffect, useState, PropsWithChildren, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { AuthProvider, AuthContext, UserData } from './AuthContext';

export type MultiplayerContextType = {
    load: (userId?: string) => void;
    matches: firebase.database.DataSnapshot|null;
    users: {
        [key: string]: UserData
    };
}

export type Match = {
    game: string;
    chat: string;
    sort: string;
    lastChat?: number;
    lastMessage?: string;
    lastMove?: number;
}

export type Game = {
    moves: { 
        // timestamp
        [key: number]: {
            // 13/10, 10/8
            moves: string,
            // cj123
            player: string
        }
    },
    state: { 
        // 1: -2
        [key: number]: number
    }
};

export type Chat = {
    messages: {
        // timestamp
        [key: number]: {
            // cj123
            author: string,
            // Hello World!
            message: string
        }
    }
}

// React context for the auth state
export const MultiplayerContext = createContext<MultiplayerContextType>({
    load: () => {},
    matches: null,
    users: {},
});
export const ChatContext = createContext<firebase.database.DataSnapshot|null>(null);
export const GameContext = createContext<firebase.database.DataSnapshot|null>(null);

export const MultiplayerProvider = ({ children }: PropsWithChildren) => {

    const database = firebase.database();

    const [match, setMatch] = useState<Match | null>(null);
    const [game, setGame] = useState<firebase.database.DataSnapshot | null>(null);
    const [chat, setChat] = useState<firebase.database.DataSnapshot | null>(null);
    const [matches, setMatches] = useState<MultiplayerContextType["matches"]>(null);
    const [users, setUsers] = useState<MultiplayerContextType["users"]>({});
    const authUser = useContext(AuthContext); // Local signed-in state.
    const context = useMemo(() => ({ 
        matches,
        users,
        load: async (userId?: string) => {
            console.log('Loading', userId);
            setGame(null);
            setChat(null);

            if (!authUser || !userId) return;
            const userSnapshot = await database.ref(`users/${userId}`).get();
            if (!userSnapshot.exists()) {
                console.error('User not found', userId);
                return;
            }
            const matchSnapshot = await database.ref(`matches/${authUser.key}/${userId}`).get();
            if (!matchSnapshot.exists()) {
                // Create new match
                const gameRef = firebase.database().ref('games').push();
                const chatRef = firebase.database().ref('chats').push();
                // Point match to game
                const data: Match = {
                    sort: new Date().toISOString(),
                    game: gameRef.key!,
                    chat: chatRef.key!,
                };
                firebase.database().ref(`matches/${authUser.key}/${userId}`).set(data);
                firebase.database().ref(`matches/${userId}/${authUser.key}`).set(data);
                setMatch(data);
            } else {
                setMatch(await matchSnapshot.val())
            }
        },
    }), [matches, authUser]);

    // Synchronize Matches
    useEffect(() => {
        if (!authUser) return;

        const queryMatches = firebase.database().ref(`matches/${authUser.key}`).orderByChild('sort').limitToLast(100);
        const subscriber = (snapshot: firebase.database.DataSnapshot) => {
            setMatches(snapshot);
            snapshot.forEach(match => {
                const userId = match.key;
                database.ref(`users/${userId}`).get().then(user => {
                    setUsers(users => ({
                        ...users,
                        [userId]: user.val()
                    }));
                });
            })   
        }
        queryMatches.on('value', subscriber);
        return () => {
            queryMatches.off('value', subscriber);
        }
    }, [authUser]);

    // Synchronize Game and Chat
    useEffect(() => {
        if (!authUser || !match) return;
        database.ref(`games/${match.game}`).get().then(setGame);
        database.ref(`chats/${match.chat}`).orderByKey().limitToLast(1000).on('value', setChat);

        return () => {
            database.ref(`chats/${match.chat}`).off('value', setChat);
        }
    }, [authUser, match]);

    return (
        <MultiplayerContext.Provider value={context}>
            <ChatContext.Provider value={chat}>
                <GameContext.Provider value={game}>
                    {children}
                </GameContext.Provider>
            </ChatContext.Provider>
        </MultiplayerContext.Provider>
    );
}