import React, { useRef, useEffect, createContext, useState, useCallback, useMemo } from 'react';
import Friends from './Friends';
import Chat from './Chat';
import Profile from './Profile';
import Login from './Login';
import type { UserData, SnapshotOrNullType } from '../Types';

export type DialogContextType = {
  state: string | boolean;
  toggle: (value: string | boolean) => void;
};

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialoguesProps {
  user: SnapshotOrNullType;
  friendData: UserData | null | undefined;
  load: (friendId?: string, authUser?: string) => void;
  reset: () => void;
  chats: SnapshotOrNullType; 
  children: React.ReactNode
}

export default function Dialogues({ user, friendData, load, reset, chats, children }: DialoguesProps) {
  const [state, setState] = useState<string | boolean>(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toggle = useCallback((value: string | boolean) => {
    setState(value);
  }, []);

  const value = useMemo(() => ({ state, toggle }), [state, toggle]);

  const isOpen = (friendData && !user) || !!state;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node) && dialogRef.current.open) {
        toggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggle]);

  return (
    <DialogContext.Provider value={value}>
      <dialog ref={dialogRef} onCancel={() => toggle(false)} open={isOpen}>
        {user ? (
          state === 'friends' ? (
            <Friends user={user} load={load} reset={reset} />
          ) : state === 'profile' ? (
            <Profile user={user} />
          ) : state === 'chat' ? (
            <Chat chats={chats} user={user} />
          ) : null
        ) : (
          <Login reset={reset} friend={friendData} load={load} />
        )}
      </dialog>
      {children}
    </DialogContext.Provider>
  );
}
