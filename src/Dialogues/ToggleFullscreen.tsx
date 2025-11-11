import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import FullscreenIcon from '@material-design-icons/svg/filled/fullscreen.svg?react';
import FullscreenExitIcon from '@material-design-icons/svg/filled/fullscreen_exit.svg?react';

const toggleFullscreen = (event: React.PointerEvent) => {
  event.preventDefault();
    document.fullscreenElement ?
        document.exitFullscreen() :
        document.documentElement.requestFullscreen();
};

export default function ToggleFullscreen() {
  const {t} = useTranslation();
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

  // Synchronize Fullscreen Icon
  useEffect(() => {
    const fullscreenchange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fullscreenchange);
    return () => document.removeEventListener('fullscreenchange', fullscreenchange);
  }, []);

  return <a onPointerUp={toggleFullscreen} href="#">
    {fullscreen ? <FullscreenExitIcon className="material-icons-svg notranslate" /> : <FullscreenIcon className="material-icons-svg notranslate" />}
    {t(fullscreen ? 'exitFullscreen' : 'fullscreen')}
  </a>;
}
