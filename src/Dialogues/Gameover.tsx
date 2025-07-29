import React from 'react';
import { useTranslation } from 'react-i18next';
import { type User } from '../Types';

interface GameoverProps {
  user: User;
  reset: () => void;
}

export default function Gameover({ user, reset }: GameoverProps) {
  const { t } = useTranslation();

  return (
    <div className="gameover">
      <h1>{t('Game Over')}</h1>
      <p>{t('Winner', { name: user.name })}</p>
      <button onClick={reset}>{t('Play Again')}</button>
    </div>
  );
}
