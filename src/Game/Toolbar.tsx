import { useCallback } from 'react'
import './Toolbar.css'
export default function Toolbar() {
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) 
            document.exitFullscreen()
        else
            document.documentElement.requestFullscreen()
    }, [])
    return <div id="toolbar">
        <a onClick={toggleFullscreen}>&#x26F6;</a>
    </div>
}