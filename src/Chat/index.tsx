import { useContext, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { AuthContext } from '../AuthContext';
import './index.css';

export default function() {
    const user = useContext(AuthContext);
    const [chats, setChats] = useState<firebase.database.DataSnapshot>([]);
    const [selectedChat, setSelectedChat] = useState<firebase.database.DataSnapshot | null>(null);

    const handleChatClick = (chat: firebase.database.DataSnapshot) => {
        setSelectedChat(chat);
    };

    return (
        <div id="chat" className='modal'>
            <h1>Chat List</h1>
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
