import { useContext } from 'react';
import Avatar from '../Avatar';
import { DialogContext } from '../Dialogues';
import type { SnapshotOrNullType } from '../Types';
import './Toolbar.css';

interface ToolbarProps {
  friendData: SnapshotOrNullType;
}

export default function Toolbar({ friendData }: ToolbarProps) {
  const { state: dialogState, toggle } = useContext(DialogContext)!;
  const friendDataValue = friendData?.val();

  return (
    <div id="toolbar" onPointerUp={(e) => { toggle(); e.stopPropagation(); }}>
      {friendDataValue
        ? <Avatar user={friendDataValue} />
        : <a className={`material-icons notranslate ${dialogState && 'active' || ''}`}>account_circle</a>}
      <h2>{friendDataValue?.name ?? 'Local'}</h2>
    </div>
  );
} 
