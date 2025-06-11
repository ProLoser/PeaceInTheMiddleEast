import React, { createContext } from 'react';
import type { ModalState } from '../Types';

// Define ModalState based on its usage in src/index.tsx
// It can be 'friends', 'profile', 'chat', or false, or other string values.
// export type ModalState = 'friends' | 'profile' | 'chat' | string | boolean;

export interface DialogContextType {
  dialogState: ModalState;
  toggleDialog: (newState: ModalState) => void;
  lastDialogState: ModalState;
}

// Provide sensible defaults or undefined if consumers should always expect a provider
const DialogContext = createContext<DialogContextType | undefined>(undefined);

export default DialogContext;
