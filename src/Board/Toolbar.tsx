import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../Avatar';
import { DialogContext } from '../Dialogues';
import type { User } from '../Types';
import './Toolbar.css';
import { classes } from '../Utils';
import AccountCircleIcon from '@material-design-icons/svg/filled/account_circle.svg?react';

interface ToolbarProps {
  friend?: User;
}

export default function Toolbar({ friend }: ToolbarProps) {
  const { t } = useTranslation();
  const { state: dialogState, toggle } = useContext(DialogContext)!;

  return (
    <div id="toolbar" onPointerUp={(e) => { toggle(); e.stopPropagation(); }}>
      {friend
        ? <Avatar user={friend} />
        : <a className={classes({ active: dialogState })}><AccountCircleIcon className="material-icons-svg notranslate" /></a>}
      <h2>{friend?.name ?? t('local')}</h2>
    </div>
  );
} 
