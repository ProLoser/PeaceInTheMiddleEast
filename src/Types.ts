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

export enum Color {
    White = 'white',
    Black = 'black',
}

export enum Status {
  Rolling = 'ROLLING',
  Moving = 'MOVING',
  GameOver = 'GAME_OVER',
}

export type ModalState = 'chat' | 'profile' | 'friends' | 'login';

export type ModalContextType = {
    toggle: (newState?: ModalState | boolean) => void;
    state: ModalState | false;
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
    player: UserData['uid'];
    move: string;
    time: string;
    friend?: UserData['uid'];
}

export type GameType = {
    status?: Status;
    board: number[] & { length: 24 };
    dice: [number, number];
    color: Color;
    turn: UserData['uid'];
    prison: {
        [color in Color]: number;
    };
    home: {
        [color in Color]: number;
    };
};

export type Chat = {
    messages: {
        // timestamp
        [key: number]: {
            // cj123
            author: UserData['uid'],
            // Hello World!
            message: string
        }
    }
}

export type ChatContextType = {
    send: (message: string) => void;
    state: SnapshotOrNullType;
}
