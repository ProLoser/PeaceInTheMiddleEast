import { useTranslation } from 'react-i18next';
import { type User } from '../Types';
import Avatar from '../Avatar';

interface GameoverProps {
  user: User;
  reset: () => void;
}

export default function Gameover({ user, reset }: GameoverProps) {
  const { t } = useTranslation();

  return (
    <div className="gameover">
      <h1>{t('gameover')}</h1>
      <Avatar user={user} />
      <p>{t('winner', { name: user.name })}</p>
      <button onClick={reset}>{t('reset')}</button>
    </div>
  );
}
