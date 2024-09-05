import { useCallback, useState, useEffect, useContext } from 'react'
import './index.css'
import { FriendContext, SwitcherContext } from '../Online/Contexts'

export default function Toolbar() {
    const {state, toggle} = useContext(SwitcherContext)
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) 
            document.exitFullscreen()
        else
            document.documentElement.requestFullscreen()
    }, [])
    const [isFullscreen, setFullscreen] = useState(false);

    // Mirror the document.fullscreenElement to react state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
    const friend = useContext(FriendContext);

    const renderFriend = friend ? <h2>{friend.val().name}</h2> : null;
    
    const toggleFriends = useCallback(() => { toggle(!state) }, [state])
    
    return <div id="toolbar">
        {document.fullscreenEnabled ? <a className="material-icons" onClick={toggleFullscreen}>{isFullscreen ?'fullscreen_exit':'fullscreen'}</a> : null}
        <a className={`material-icons ${state&&'active'||''}`} onClick={toggleFriends}>account_circle</a>
        {renderFriend}
    </div>
}