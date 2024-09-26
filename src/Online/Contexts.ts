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

export type ModalState = 'chat' | 'profile' | 'friends' | 'login' | boolean;

export type ModalContextType = {
    toggle: (newState: ModalState) => void;
    state: ModalState;
};

export type Match = {
    game: string;
    chat: string;
    sort: string;
    lastChat?: number;
    lastMessage?: string;
    lastMove?: number;
}

export type Move = {
    player: string;
    game: string;
    move: string;
    time: string;
}

export type GameType = {
    status?: string;
    board: number[];
    dice: number[];
    prison: {
        black: number;
        white: number;
    };
    home: {
        black: number;
        white: number;
    };
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
    state: SnapshotOrNullType;
}

export const AuthContext = createContext<SnapshotOrNullType>(null);
export const MultiplayerContext = createContext({ 
    load: (userId: UserData["uid"]) => { },
    move: (game: GameType, move: string) => { },
    chat: (message: string) => { },
    reset: () => { },
});
export const ChatContext = createContext<SnapshotOrNullType>(null);
export const MatchContext = createContext<Match|null>(null);
export const FriendContext = createContext<SnapshotOrNullType>(null);
export const ModalContext = createContext<ModalContextType>({
    toggle: (newState: ModalState) => { },
    state: false
});