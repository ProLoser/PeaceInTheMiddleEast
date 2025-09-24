import { useContext } from 'react';
import Avatar from '../Avatar';
import { DialogContext } from '../Dialogues';
import type { User } from '../Types';
import './Toolbar.css';
import { classes } from '../Utils';
import { AccountCircleIcon } from '../Icons';

interface ToolbarProps {
  friend?: User;
}

export default function Toolbar({ friend }: ToolbarProps) {
  const { state: dialogState, toggle } = useContext(DialogContext)!;

  return (
    <div id="toolbar" onPointerUp={(e) => { toggle(); e.stopPropagation(); }}>
      {friend
        ? <Avatar user={friend} />
        : <a className={classes({ active: dialogState })}><AccountCircleIcon /></a>}
      <h2>{friend?.name ?? 'Local'}</h2>
    </div>
  );
} 
