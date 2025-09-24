import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Components/Icon';

const toggleFullscreen = (event: React.PointerEvent) => {
    event.preventDefault();
    document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen()
}

export default function ToggleFullscreen() {
    const { t } = useTranslation();
    const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

    // Synchronize Fullscreen Icon 
    useEffect(() => {
        const fullscreenchange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fullscreenchange);
        return () => document.removeEventListener('fullscreenchange', fullscreenchange);
    }, [])

    return <a onPointerUp={toggleFullscreen} href="#">
        <Icon name={fullscreen ? 'fullscreen_exit' : 'fullscreen'} className="notranslate" />
        {t(fullscreen ? 'exitFullscreen' : 'fullscreen')}
    </a>
}