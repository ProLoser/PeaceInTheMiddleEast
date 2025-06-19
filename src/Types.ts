import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export type SnapshotOrNullType = firebase.database.DataSnapshot | null

export type UserData = {
    uid: string;
    name: string;
    search: string;
    photoURL: string | null;
    language: string;
    fcmToken?: string;
}

export enum Color = {
    White = 'WHITE',
    Black = 'BLACK',
}

export enum Status {
  Rolling = 'ROLLING',
  Moving = 'MOVING',
  GameOver = 'GAME_OVER',
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
    move: string;
    time: string;
    friend?: string;
}

export type GameType = {
    status?: string;
    board: number[];
    dice: number[];
    color: 'black' | 'white';
    turn: string;
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
