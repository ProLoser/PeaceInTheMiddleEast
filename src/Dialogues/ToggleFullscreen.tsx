import { useEffect, useState } from 'react';

const toggleFullscreen = (event: React.PointerEvent) => {
    event.preventDefault();
    document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen()
}

export default function ToggleFullscreen() {
    const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

    // Synchronize Fullscreen Icon 
    useEffect(() => {
        const fullscreenchange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fullscreenchange);
        return () => document.removeEventListener('fullscreenchange', fullscreenchange);
    }, [])

    return <a onPointerUp={toggleFullscreen} href="#">
        <span className="material-icons notranslate">{fullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
    </a>
}