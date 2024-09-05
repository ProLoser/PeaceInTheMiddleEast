import { createContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export type SnapshotOrNullType = firebase.database.DataSnapshot | null

export type UserData = {
    uid: string;
    name: string;
    photoURL: string | null;
    language: string;
}

export type SwitcherState = 'chat' | 'profile' | 'friends' | 'login' | boolean;

export type SwitcherContextType = {
    toggle: (newState: SwitcherState) => void;
    state: SwitcherState;
};

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

export type ChatContextType = {
    send: (message: string) => void;
    state: Chat | null;
}

export const AuthContext = createContext<SnapshotOrNullType>(null);
export const MultiplayerContext = createContext({ 
    load: (userId: UserData["uid"]) => { },
    move: (nextBoard: number[], move: string) => { },
});
export const ChatContext = createContext<ChatContextType>({
    send: (message: string) => { },
    state: null
});
export const GameContext = createContext<SnapshotOrNullType>(null);
export const FriendContext = createContext<SnapshotOrNullType>(null);
export const SwitcherContext = createContext<SwitcherContextType>({
    toggle: (newState: SwitcherState) => { },
    state: false
});