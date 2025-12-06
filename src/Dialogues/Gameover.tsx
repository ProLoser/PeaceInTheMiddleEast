import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { type User } from '../Types';
import Avatar from '../Avatar';
import RestartAltIcon from '@material-design-icons/svg/filled/restart_alt.svg?react';
import confetti from 'canvas-confetti';

interface GameoverProps {
  user: User;
  reset: () => void;
  isWinner?: boolean;
}

const CONFETTI_COLORS = ['#bb0000', '#ffffff', '#00bb00'];

export default function Gameover({ user, reset, isWinner }: GameoverProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isWinner) return;

    const duration = 3000;
    const end = Date.now() + duration;
    let animationFrameId: number;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: CONFETTI_COLORS
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: CONFETTI_COLORS
      });

      if (Date.now() < end) {
        animationFrameId = requestAnimationFrame(frame);
      }
    };

    frame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWinner]);

  return (
    <div className="gameover">
      <h1>🎉 {t('gameover')} 🎉</h1>
      <Avatar user={user} />
      <p>{t('winner', { name: user.name })}</p>
      <button className="dialog-button" onClick={reset}>
        <RestartAltIcon className="material-icons-svg notranslate" />
        {t('reset')}
      </button>
    </div>
  );
}
