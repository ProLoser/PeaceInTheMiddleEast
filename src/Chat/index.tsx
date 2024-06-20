import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { useAuth } from '../AuthContext';
import './index.css';

export default function() {
    const user = useAuth()
    const [chats, setChats] = useState<firebase.database.DataSnapshot>([]);

    useEffect(() => {
        // Fetch chats from Firebase collection
        const fetchChats = async () => {
            const db = firebase.database();
            const snapshot = await db.collection('chats').get();
            const chatsData = snapshot.docs.map((doc) => doc.data());
            setChats(chatsData);
        };

        fetchChats();
    }, [user]);

    return (
        <div id="chat" className='modal'>
            <h1>Chat List</h1>
            <ul>
                {chats.map((chat: firebase.firestore.DocumentData) => (
                    <li key={chat.id}>{chat.name}</li>
                ))}
            </ul>

            <h1>Conversation</h1>
            {/* Render conversation screen here */}
        </div>
    );
};