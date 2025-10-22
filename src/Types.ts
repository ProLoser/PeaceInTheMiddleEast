import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export type SnapshotOrNullType = firebase.database.DataSnapshot | null

export type User = {
    uid: string;
    name: string;
    search: string;
    photoURL: string | null;
    language: string;
    fcmToken?: string; // Legacy: single token (for backward compatibility)
    fcmTokens?: { [token: string]: { ts: number; ua: string } }; // Token is key, value contains metadata
}

export const enum Color {
    White = 'white',
    Black = 'black',
}

export const enum Status {
  Rolling = 'ROLLING',
  Moving = 'MOVING',
  GameOver = 'GAME_OVER',
}

export const enum Modal {
    Chat = 'chat',
    Profile = 'profile',
    Friends = 'friends',
    Login = 'login',
    Gameover = 'gameover'
}

export type ModalContextType = {
    toggle: (newState?: Modal | boolean) => void;
    state: Modal | false;
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
    player: User['uid'];
    move: string;
    time: string;
    friend?: User['uid'];
}

export type Game = {
    status?: Status;
    board: number[] & { length: 24 };
    dice: [number, number];
    color: Color;
    turn: User['uid'];
    prison: {
        [color in Color]: number;
    };
    home: {
        [color in Color]: number;
    };
};

export type UsedDie = {
    value: number;
    label: string;
};

export type Chat = {
    messages: {
        // timestamp
        [key: number]: {
            // cj123
            author: User['uid'],
            // Hello World!
            message: string
        }
    }
}

export type ChatContextType = {
    send: (message: string) => void;
    state: SnapshotOrNullType;
}
