import { useCallback, useState, useEffect } from 'react'
import './Toolbar.css'
import Friends from './Friends'
import Chat from './Chat'

export default function Toolbar() {
    const [showFriends, setLogin] = useState(false)
    const [showChat, setChat] = useState(false)
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) 
            document.exitFullscreen()
        else
            document.documentElement.requestFullscreen()
    }, [])
    const [isFullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
    
    const toggleChat = useCallback(() => { setChat( previous => !previous)   }, [])
    const toggleFriends = useCallback(() => { setLogin( previous => !previous)   }, [])
    return <div id="toolbar">
        {document.fullscreenEnabled ? <a className="material-icons" onClick={toggleFullscreen}>{isFullscreen ?'fullscreen_exit':'fullscreen'}</a> : null}
        <a className="material-icons" onClick={toggleChat}>chat</a>
        {showChat && <Chat />}
        <a className="material-icons" onClick={toggleFriends}>account_circle</a>
        <Friends show={showFriends} />
    </div>
}