// Import FirebaseAuth and firebase.
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from '../StyledFirebaseAuth';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { useAuth } from '../AuthContext';
import './index.css'

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
    },
};


function createMatch(user1: string, user2: string) {
    // Create new game record
    const gameRef = firebase.database().ref('games').push();
    // Point match to game
    const data = {
        sort: Date.now(),
        game: gameRef.key,
    };
    firebase.database().ref(`matches/${user1}/${user2}/game`).set(data);
    firebase.database().ref(`matches/${user2}/${user1}/game`).set(data);
}

type UserData = {
    name: string;
    photoURL: string;
    language: string;
}

export default function Login({ show }: { show: boolean }) {
    const [matches, setMatches] = useState<firebase.database.DataSnapshot[]>([]);
    const [selected, setSelected] = useState<firebase.database.DataSnapshot | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const user = useAuth(); // Local signed-in state.
    const [userData, setUserData] = useState<UserData|null>(null);
    const [newFriend, setNewFriend] = useState<UserData|null>(null);

    // onLogin
    useEffect(() => {
        if (!user) return;
        const matchesRef = firebase.database().ref(`matches/${user.uid}`).orderByChild('sort')
        const userRef = firebase.database().ref(`users/${user.uid}`)
        const subscriber = (snapshot: firebase.database.DataSnapshot) => {
            const matchesArray: firebase.database.DataSnapshot[] = [];
            snapshot.forEach((childSnapshot) => {
                matchesArray.push(childSnapshot);
            });
            setMatches(matchesArray);
        };
        userRef.get().then(snapshot => {
            let data = snapshot.val() as UserData;
            if (!data) {
                // Upload initial user data
                data = {
                    name: user.displayName,
                    photoURL: user.photoURL,
                    language: navigator.language,
                } as UserData;
                console.log('Creating user', data);
                userRef.set(data);
            }
            setUserData(data);
        });
        matchesRef.on('value', subscriber);
        return () => {
            matchesRef.off('value', subscriber);
        }
    }, [user]);

    // Match Listener
    useEffect(() => {
        if (!user || !selected) return;
        const matchesRef = firebase.database().ref(`games/${selected.val().game}`)
        const subscriber = (snapshot: firebase.database.DataSnapshot) => {
            const matchesArray: firebase.database.DataSnapshot[] = [];
            snapshot.forEach((childSnapshot) => {
                matchesArray.push(childSnapshot);
            });
            setMatches(matchesArray);
        };
        matchesRef.on('value', subscriber);
        return () => matchesRef.off('value', subscriber);
    }, [user, selected]);

    const handleChatClick = useCallback((chat: firebase.database.DataSnapshot) => {
        setSelected(chat);
    }, []);

    const onSearch = useCallback(async event => {
        if (!user || !searchRef.current?.value) return;
        const search = searchRef.current.value
        const friend = await firebase.database().ref(`users/${search}`).get()
        if (friend.exists()) {
            // user found
            const match = await firebase.database().ref(`matches/${user.uid}/${friend.key}`).get()
            if (!match.exists()) {
                setNewFriend(friend.val() as UserData);
            }
            // createMatch(user.uid, snapshot.key as string);
        }
    }, [user]) as ChangeEventHandler<HTMLInputElement>;

    if (!show) return null;

    return user ? (
        <div id="friends" className='modal'>
            <h1>Matches</h1>
            <a onClick={() => firebase.auth().signOut()}>Sign-out: </a>
            <span>{user.uid}</span>
            <div id="chat">
                <input name="search" ref={searchRef} type="search" placeholder="Search for Friends" onChange={onSearch} />
                <ul>
                    {newFriend && (
                        <li onClick={() => openMatch(newFriend)}>New Match: {newFriend}</li>
                    )}
                    {matches.map((chat: firebase.database.DataSnapshot) => (
                        <li key={chat.key} onClick={() => handleChatClick(chat)}>
                            {chat.val().name}: {chat.val().messages.length} messages
                        </li>
                    ))}
                </ul>
                {selected && (
                    <div>
                        <h2>{selected.val().name}</h2>
                        {selected.val().messages.map((message: string, index: number) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div id="friends" className='modal'>
            <h1>Play Online</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
}
