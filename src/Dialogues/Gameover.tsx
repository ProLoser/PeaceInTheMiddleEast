import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type User } from '../Types';
import Avatar from '../Avatar';
import RestartAltIcon from '@material-design-icons/svg/filled/restart_alt.svg?react';
import confetti from 'canvas-confetti';

interface GameoverProps {
  user: User;
  reset: () => void;
}

export default function Gameover({ user, reset }: GameoverProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="gameover">
      <h1>{t('gameover')}</h1>
      <Avatar user={user} />
      <p>{t('winner', { name: user.name })}</p>
      <button className="dialog-button" onClick={reset}>
        <RestartAltIcon className="material-icons-svg notranslate" />
        {t('reset')}
      </button>
    </div>
  );
}
