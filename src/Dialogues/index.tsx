import React, { useContext, useRef, useEffect } from 'react';
import DialogContext, { DialogContextType } from './DialogContext';
import Friends from './Friends';
import Chat from './Chat';
import Profile from './Profile';
import Login from './Login';
import type { UserData, SnapshotOrNullType } from '../Types'; // Assuming these types are needed from App.tsx

// Props that DialogContainer will receive from App.tsx
// These are the props that were originally passed to the individual dialog components from App.tsx
interface DialogContainerProps {
  user: SnapshotOrNullType; // From App's state
  friendData: UserData | null | undefined; // From App's state (derived from `friend` snapshot)
  load: (friendId?: string, authUser?: string) => void; // From App's methods
  reset: () => void; // From App's methods
  chats: SnapshotOrNullType; // From App's state
  // Add any other props that individual dialogs might need from App.tsx
}

const DialogContainer: React.FC<DialogContainerProps> = ({
  user,
  friendData,
  load,
  reset,
  chats,
}) => {
  const context = useContext(DialogContext);

  if (!context) {
    // This should not happen if the provider is set up correctly in App.tsx
    console.error('DialogContext not found. Make sure DialogProvider is wrapping this component.');
    return null;
  }

  const { dialogState, toggleDialog } = context;
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Determine if the dialog should be open
  // This combines the logic from the original <dialog open={(friendData&&!user)||!!state}>
  const isOpen = (friendData && !user) || !!dialogState;

  // Effect for managing "click outside to close"
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the dialog is shown and the click is outside its content
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        toggleDialog(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleDialog]); // Dependencies for the click outside effect

  // Effect for calling showModal and close on the dialog element
  useEffect(() => {
    if (dialogRef.current) {
      if (isOpen) {
        if (!dialogRef.current.open) {
          dialogRef.current.showModal();
        }
      } else {
        if (dialogRef.current.open) {
          dialogRef.current.close();
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null; // Don't render the dialog if it shouldn't be open
  }

  return (
    <dialog ref={dialogRef} onCancel={() => toggleDialog(false)}>
      {user ? (
        dialogState === 'friends' ? (
          <Friends authUser={user} load={load} reset={reset} />
        ) : dialogState === 'profile' ? (
          <Profile authUser={user} />
        ) : dialogState === 'chat' ? (
          <Chat chats={chats} user={user} />
        ) : null
      ) : (
        <Login reset={reset} friend={friendData} load={load} />
      )}
    </dialog>
  );
};

export default DialogContainer;
