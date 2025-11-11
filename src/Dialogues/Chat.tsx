import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './Chat.css';
import {SnapshotOrNullType} from '../Types';

interface ChatProps {
    chats: SnapshotOrNullType;
    user: SnapshotOrNullType;
}

export default function Chat({chats}: ChatProps) {
  const {t} = useTranslation();
  // TODO: Implement Chat form
  const [selectedChat, setSelectedChat] = useState<firebase.database.DataSnapshot | null>(null);

  const handleChatClick = (chat: firebase.database.DataSnapshot) => {
    setSelectedChat(chat);
  };

  return (
    <div id="chat">
      <h1>{t('chat')}</h1>
      <ul>
        {chats && chats.val() && Object.keys(chats.val()).map((chatId: string) => {
          const chat = chats.child(chatId);
          return (
            <li key={chatId} onPointerUp={() => handleChatClick(chat)}>
              {chat.val()?.name || chatId}
            </li>
          );
        })}
      </ul>

      <h1>{t('chat')}</h1>
      {selectedChat && (
        <div>
          <h2>{selectedChat.val()?.name || selectedChat.key}</h2>
          {selectedChat.val()?.messages && (Object.values(selectedChat.val().messages) as Array<{message: string}>).map((message, index: number) => (
            <p key={index}>{message.message}</p>
          ))}
          <input type="text" placeholder={t('chatPlaceholder')} />
        </div>
      )}
    </div>
  );
}
