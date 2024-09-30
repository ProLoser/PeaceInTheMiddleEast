// Import FirebaseAuth and firebase.
import { useState, useCallback, useRef, useContext, ReactNode, useEffect } from 'react';
import type { ChangeEventHandler } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AuthContext, UserData } from '../Contexts';
import './index.css'
import { MultiplayerContext, Match, ModalContext } from '../Contexts';
import { Avatar } from '../Profile';
import { formatDistance } from 'date-fns';

// const toggleFullscreen = () => document.fullscreenElement
//     ? document.exitFullscreen()
//     : document.documentElement.requestFullscreen()
type Users = {[key: string]: UserData}

export default function Friends() {
    const searchRef = useRef<HTMLInputElement>(null);
    const authUser = useContext(AuthContext); // Local signed-in state.
    const [users, setUsers] = useState<Users>({});
    const [isExpanded, setIsExpanded] = useState(false);
    const { load, reset } = useContext(MultiplayerContext);
    const { toggle } = useContext(ModalContext);
    const [matches, setMatches] = useState<firebase.database.DataSnapshot>([]);
    const [searchResults, setSearchResults] = useState<firebase.database.DataSnapshot>([]);
    // const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

    // // Synchronize Fullscreen Icon
    // useEffect(() => {
    //     const fullscreenchange = () => setFullscreen(!!document.fullscreenElement);
    //     document.addEventListener('fullscreenchange', fullscreenchange);
    //     return () => document.removeEventListener('fullscreenchange', fullscreenchange);
    // })


    // Synchronize Matches
    useEffect(() => {
        if (!authUser) return;

        const queryMatches = firebase.database().ref(`matches/${authUser.key}`).orderByChild('sort').limitToLast(100);
        const subscriber = (snapshot: firebase.database.DataSnapshot) => {
            setMatches(snapshot);
            snapshot.forEach(match => {
                const userId = match.key;
                firebase.database().ref(`users/${userId}`).get().then((user: firebase.database.DataSnapshot) => {
                    setUsers(users => ({
                        ...users,
                        [userId]: user.val()
                    }));
                });
            })
        }
        queryMatches.on('value', subscriber);
        return () => {
            queryMatches.off('value', subscriber);
        }
    }, [authUser]);
    
    const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(async() => {
        if (searchRef.current?.value) {
            const search = searchRef.current.value
            const searchSnapshot = await firebase.database().ref('users').orderByChild('name').startAt(search).get();
            // const results: UserData[] = []
            // searchSnapshot.forEach(result => {
            //     results.push(result.val())
            // })
            setSearchResults(searchSnapshot)
        } else {
            setSearchResults([])
        }
    }, []);

    if (!authUser) return null;

    const renderFriends: ReactNode[] = []
    const friends: string[] = []

    const NOW = new Date()

    const row = (user: UserData, match?: Match) => <li key={user.uid} onClick={() => load(user.uid)}>
            <Avatar user={user} />
            <div>
                <h3>{user.name}</h3>
                <time>{match?.sort && formatDistance(new Date(match.sort), NOW, { addSuffix: true })}</time>
                {match?.lastMessage}
            </div>
        </li>

    const searchReject = (user: UserData) => 
        searchRef.current?.value 
        && !(new RegExp(searchRef.current?.value, 'i')).test(user.name) 
        && !(new RegExp(searchRef.current?.value, 'i')).test(user.uid)

    matches?.forEach(match => {
        const matchData: Match = match.val()
        if (!users[match.key] || searchReject(users[match.key])) {
            return;
        }
        friends.push(match.key)
        renderFriends.unshift(row(users[match.key], matchData))
    })
    searchResults.forEach(result => {
        const resultData: UserData = result.val()
        if (result.key === authUser.key || friends.includes(result.key) || searchReject(resultData)) {
            return;
        }
        renderFriends.push(row(resultData))
    })

    const invite = () => {
        if (authUser.key) {
            const shareUrl = (new URL(authUser.key, location.href)).toString()
            navigator.clipboard?.writeText?.(shareUrl)
            navigator.share?.({
                url: shareUrl,
                title: 'Dean invited you to play Backgammon'
            })
        }
    }

    return <div id="friends" className='modal'>
        <button
            aria-haspopup="menu"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="material-icons"
        >
            settings
        </button>
        <menu>
            <li>
                <a onClick={invite}>
                    <span className="material-icons">person_add_alt_1</span>
                    Invite Friend
                </a>
            </li>
            {/* {document.fullscreenEnabled ?
                <li>
                    <a onClick={toggleFullscreen}>
                        <span className="material-icons">{fullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                        Fullscreen
                    </a>
                </li>
                : null} */}
            <li>
                <a onClick={() => toggle('profile')}>
                    <span className="material-icons">manage_accounts</span>
                    Edit Profile
                </a>
            </li>
            <li>
                <a onClick={reset}>
                    <span className="material-icons">restart_alt</span>
                    Reset Match
                </a>
            </li>
            <li>
                <a onClick={() => firebase.auth().signOut()}>
                    <span className="material-icons">logout</span>
                    Logout
                </a>
            </li>
        </menu>
        <h1>
            <span>
                <span>{authUser.val().name}'s</span>
                Matches
            </span>
        </h1>
        <div id="people">
            <input name="search" ref={searchRef} type="search" autoComplete="off" placeholder="Search for Friends" onChange={onSearch} />
            <ul>
                {renderFriends}
            </ul>
        </div>
    </div>
}
