import { useCallback, useContext } from 'react'
import './index.css'
import { FriendContext, ModalContext } from '../Online/Contexts'

export default function Toolbar() {
    const {state, toggle} = useContext(ModalContext)
    const friend = useContext(FriendContext);

    const renderFriend = friend ? <h2>{friend.val().name}</h2> : null;
    
    const toggleFriends = useCallback(() => { toggle(!state) }, [state])
    
    return <div id="toolbar">
        <a className={`material-icons ${state&&'active'||''}`} onClick={toggleFriends}>account_circle</a>
        {renderFriend}
    </div>
}