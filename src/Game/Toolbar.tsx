import { useCallback } from 'react'
import './Toolbar.css'
export default function Toolbar() {
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) 
            document.exitFullscreen()
        else
            document.documentElement.requestFullscreen()
    }, [])
    const toggleChat = useCallback(() => {    }, [])
    const toggleAccount = useCallback(() => {    }, [])
    return <div id="toolbar">
        {document.fullscreenEnabled ? <a onClick={toggleFullscreen}>&#x26F6;</a> : null}
        <a onClick={toggleChat}>&#128488;</a>
        <a onClick={toggleAccount}>&#127757;</a>
    </div>
}