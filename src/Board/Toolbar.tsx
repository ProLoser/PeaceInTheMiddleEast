import { useContext } from 'react';
import Avatar from '../Avatar';
import { DialogContext } from '../Dialogues';
import type { User } from '../Types';
import './Toolbar.css';
import { classes } from '../Utils';
import AccountCircleIcon from '@material-design-icons/svg/outlined/account_circle.svg?react';
import LanguageIcon from '@material-design-icons/svg/filled/language.svg?react';
import { useTranslation } from 'react-i18next';

interface ToolbarProps {
  friend?: User;
}

export default function Toolbar({ friend }: ToolbarProps) {
  const { state: dialogState, toggle } = useContext(DialogContext)!;
  const { t } = useTranslation();
  return (
    <div id="toolbar" onPointerUp={(e) => { toggle(); e.stopPropagation(); }} className={classes({ active: dialogState })}>
      {friend
        ? <Avatar user={friend} />
        : <span className="offline-icon">
            <LanguageIcon className="material-icons-svg notranslate" />
            <AccountCircleIcon className="material-icons-svg notranslate" />
          </span>}
      <h2>{friend?.name ?? t('local')}</h2>
    </div>
  );
} 
