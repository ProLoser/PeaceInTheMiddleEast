import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { useAuth } from './AuthContext';

// React context for the auth state
export const MultiplayerContext = createContext({});

// Provider component for the auth context
export function MultiplayerProvider({ children }: { children: ReactNode}) {
    const [value, setValue] = useState({});
    const authUser = useAuth(); // Local signed-in state.

    async function load(user: string) {
        if (!authUser) return;
        const database = firebase.database();
        const userSnapshot = await database.ref(`users/${user}`).get();
        if (!userSnapshot.exists()) {
            console.error('User not found', user);
            return;
        }
        const matchSnapshot = await database.ref(`matches/${authUser.uid}/${user}`).get();
        let gameSnapshot: firebase.database.DataSnapshot;
        if (!matchSnapshot.exists()) {
            // Create new game record
            const gameRef = firebase.database().ref('games').push();
            // Point match to game
            const data = {
                sort: Date.now(),
                game: gameRef.key,
            };
            firebase.database().ref(`matches/${authUser.uid}/${user}/game`).set(data);
            firebase.database().ref(`matches/${user}/${authUser.uid}/game`).set(data);
            gameSnapshot = await gameRef.get();
        } else {
            gameSnapshot = await database.ref(`games/${matchSnapshot.val().game}`).get();
        }
        setValue({ userSnapshot, matchSnapshot, gameSnapshot, load })
    }

    return (
        <MultiplayerContext.Provider value={value}>
            {children}
        </MultiplayerContext.Provider>
    );
}

// Hook to use the context
export function useMultiplayer() {
    return useContext(MultiplayerContext);
}