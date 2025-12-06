import React, { useRef, useEffect, createContext, useState, useCallback, useMemo } from 'react';
import Friends from './Friends';
import Chat from './Chat';
import Profile from './Profile';
import Login from './Login';
import './Dialogues.css';
import Gameover from './Gameover';
import { Modal, type User, type SnapshotOrNullType } from '../Types';

export type DialogContextType = {
  state: string | boolean;
  toggle: (value?: string | boolean) => void;
};

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialoguesProps {
  user: SnapshotOrNullType;
  friend: User | undefined;
  load: (friendId?: string | false, authUser?: string) => void;
  reset: () => void;
  chats: SnapshotOrNullType;
  gameover: User | undefined;
  children: React.ReactNode
}

export default function Dialogues({ user, friend, load, reset, chats, gameover, children }: DialoguesProps) {
  const [state, setState] = useState<string | boolean>(false);
  const [lastDialog, setLastDialog] = useState<Modal>(Modal.Friends);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggle = useCallback((value?: string | boolean) => {
    if (value === undefined) {
      setState(state => state ? false : lastDialog);
    } else if (typeof value === 'string') {
      setState(value);
      setLastDialog(value as Modal);
    } else {
      setState(value);
    }
  }, [lastDialog]);

  const value = useMemo(() => ({ state, toggle }), [state, toggle]);

  const isOpen = (friend && !user) || !!state || !!gameover;

  useEffect(() => {
    const handleClickOutside = () => {
      toggle(false);
    };

    if (isOpen) {
      document.addEventListener('pointerup', handleClickOutside);
    }

    return () => {
      document.removeEventListener('pointerup', handleClickOutside);
    };
  }, [isOpen, toggle]);

  return (
    <DialogContext.Provider value={value}>
      <dialog ref={dialogRef} onCancel={() => toggle(false)} open={isOpen} onPointerUp={event => event.stopPropagation()}>
        {user ? (
          state === 'friends' ? (
            <Friends user={user} load={load} reset={reset} friend={friend} />
          ) : state === 'profile' ? (
            <Profile user={user} />
          ) : state === 'chat' ? (
            <Chat chats={chats} user={user} />
          ) : gameover ? (
            <Gameover user={gameover} reset={reset} isWinner={user?.key === gameover.uid} />
          ) : null
        ) : (
          <Login reset={reset} friend={friend} load={load} />
        )}
      </dialog>
      {children}
    </DialogContext.Provider>
  );
}
