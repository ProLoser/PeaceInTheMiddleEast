// Import FirebaseAuth and firebase.
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
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

export default function Login({ show }: { show: boolean }) {
    const [chats, setChats] = useState<firebase.database.DataSnapshot[]>([]);
    const [selectedChat, setSelectedChat] = useState<firebase.database.DataSnapshot | null>(null);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        const fetchChats = async () => {
            const chatRef = firebase.database().ref('chats');
            chatRef.on('value', (snapshot) => {
                const chatArray: firebase.database.DataSnapshot[] = [];
                snapshot.forEach((childSnapshot) => {
                    chatArray.push(childSnapshot);
                });
                setChats(chatArray);
            });
        };

        fetchChats();
    }, []);

    const handleChatClick = useCallback((chat: firebase.database.DataSnapshot) => {
        setSelectedChat(chat);
    }, []);

    const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value);
    }, []);

    const user = useAuth(); // Local signed-in state.
    if (!show) return null;
    return user ? (
        <div id="friends" className='modal'>
            <h1>Matches</h1>
            <a onClick={() => firebase.auth().signOut()}>Sign-out: </a>
            <span>{user.uid}</span>
            <div id="chat">
                <input type="search" placeholder="Search for Friends" onChange={onSearch} />
                <ul>
                    {chats.map((chat: firebase.database.DataSnapshot) => (
                        <li key={chat.key} onClick={() => handleChatClick(chat)}>
                            {chat.val().name}
                        </li>
                    ))}
                </ul>
                {selectedChat && (
                    <div>
                        <h2>{selectedChat.val().name}</h2>
                        {selectedChat.val().messages.map((message: string, index: number) => (
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
