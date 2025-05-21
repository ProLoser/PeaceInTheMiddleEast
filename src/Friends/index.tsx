// Import FirebaseAuth and firebase.
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from '../StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
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

export default function Login({ show }: { show: boolean}) {
    const user = useAuth(); // Local signed-in state.
    if (!show) return null;
    return user ? (
        <div id="friends" className='modal'>
            <pre>{JSON.stringify(user.uid)}</pre> <a onClick={() => firebase.auth().signOut()}>Sign-out</a>
            <Friends />
        </div>
    ) : (
        <div id="friends" className='modal'>
            <h1>Play Online</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
}

import { useEffect, useState } from 'react';
// import firebase from 'firebase/compat/app';
// import { useAuth } from '../AuthContext';
import {getDatabase, ref, onChildAdded } from 'firebase/database';
// import './index.css';



export function Friends() {
    const user = useAuth();
    const [chats, setChats] = useState<firebase.database.DataSnapshot>([]);
    const [selectedChat, setSelectedChat] = useState<firebase.database.DataSnapshot | null>(null);

    const handleChatClick = (chat: firebase.database.DataSnapshot) => {
        setSelectedChat(chat);
    };

    useEffect(() => {
        if (!selectedChat) return;
        // Listen for comments.

        const database = getDatabase();
        const commentsRef = ref(database, `chats/${selectedChat}`);
        let offChildAdded = onChildAdded(commentsRef, function (data) {
            // addCommentElement(
            //     postElement,
            //     data.key,
            //     data.val().text,
            //     data.val().author,
            // );
        });
        return () => {
            offChildAdded()
        }
    }, [selectedChat])

    return (
        <div id="chat">
            <h1>Friends</h1>
            <ul>
                {chats.map((chat: firebase.database.DataSnapshot) => (
                    <li key={chat.key} onClick={() => handleChatClick(chat)}>
                        {chat.val().name}
                    </li>
                ))}
            </ul>

            <h1>Conversation</h1>
            {selectedChat && (
                <div>
                    <h2>{selectedChat.val().name}</h2>
                    {selectedChat.val().messages.map((message: string, index: number) => (
                        <p key={index}>{message}</p>
                    ))}
                </div>
            )}
        </div>
    );
};
