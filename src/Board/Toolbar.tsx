import { useContext } from 'react';
import Avatar from '../Avatar';
import { DialogContext } from '../Dialogues';
import type { User } from '../Types';
import './Toolbar.css';

interface ToolbarProps {
  friend?: User;
}

export default function Toolbar({ friend }: ToolbarProps) {
  const { state: dialogState, toggle } = useContext(DialogContext)!;

  return (
    <div id="toolbar" onPointerUp={(e) => { toggle(); e.stopPropagation(); }}>
      {friend
        ? <Avatar user={friend} />
        : <a className={`material-icons notranslate ${dialogState && 'active' || ''}`}>account_circle</a>}
      <h2>{friend?.name ?? 'Local'}</h2>
    </div>
  );
} 
