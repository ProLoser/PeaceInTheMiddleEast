import { useState, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './Chat.css';

export default function ({ chats, user }) {
    // TODO: Implement Chat form
    const [selectedChat, setSelectedChat] = useState<firebase.database.DataSnapshot | null>(null);

    const handleChatClick = (chat: firebase.database.DataSnapshot) => {
        setSelectedChat(chat);
    };

    const chat = useCallback((chatId: string, message: string) => {
        if (chatId && user) {
            firebase.database().ref(`chats/${chatId}`).push({
                message,
                author: user.key,
                time: new Date().toISOString()
            })
        }
    }, [user]);

    return (
        <div id="chat">
            <h1>Chat List</h1>
            <ul>
                {chats.map((chat: firebase.database.DataSnapshot) => (
                    <li key={chat.key} onPointerUp={() => handleChatClick(chat)}>
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
