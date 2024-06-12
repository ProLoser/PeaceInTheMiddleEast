import { useCallback, useState } from 'react'
import './Toolbar.css'
import Login from '../Login'

export default function Toolbar() {
    const [showLogin, setLogin] = useState(false)
    const [showChat, setChat] = useState(false)
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) 
            document.exitFullscreen()
        else
            document.documentElement.requestFullscreen()
    }, [])

    const toggleChat = useCallback(() => { setChat( previous => !previous)   }, [])
    const toggleLogin = useCallback(() => { setLogin( previous => !previous)   }, [])
    return <div id="toolbar">
        {document.fullscreenEnabled ? <a onClick={toggleFullscreen}>&#x26F6;</a> : null}
        <a onClick={toggleChat}>&#128488;</a>
        {showChat && <Chat />}
        <a onClick={toggleLogin}>&#127757;</a>
        {showLogin && <Login />}
    </div>
}