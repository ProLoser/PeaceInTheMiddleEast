// Import FirebaseAuth and firebase.
import { useState, useCallback, useRef, useContext, ReactNode, useEffect } from 'react';
import type { ChangeEventHandler } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AuthContext, UserData } from '../Contexts';
import './index.css'
import { MultiplayerContext, Match, SwitcherContext } from '../Contexts';
import { Avatar } from '../Profile';

type Users = {[key: string]: UserData}

export default function Friends() {
    const searchRef = useRef<HTMLInputElement>(null);
    const authUser = useContext(AuthContext); // Local signed-in state.
    const [users, setUsers] = useState<Users>({});
    const { load } = useContext(MultiplayerContext);
    const { toggle } = useContext(SwitcherContext);
    const [matches, setMatches] = useState<firebase.database.DataSnapshot>([]);
    const [searchResults, setSearchResults] = useState<firebase.database.DataSnapshot>([]);

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

    const row = (user: UserData, match?: Match) => <li key={user.uid} onClick={() => load(user.uid)}>
            <Avatar user={user} />
            <strong>
                {user?.name}:
            </strong>
            <small style={{ float: 'right' }}>{match?.sort}</small>
            {match?.lastMessage}
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
        if (friends.includes(result.key) || searchReject(resultData)) {
            return;
        }
        renderFriends.push(row(resultData))
    })

    return <div id="friends" className='modal'>
        <h1>
            <a onClick={() => toggle('profile')}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z" />
                </svg>
            </a>
            <span>
                <span>{authUser.val().name}'s</span>
                Matches
            </span>
            <a onClick={() => firebase.auth().signOut()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-logout">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                </svg>
            </a>
        </h1>
        <div id="people">
            <input name="search" ref={searchRef} type="search" placeholder="Search for Friends" onChange={onSearch} />
            <ul>
                {renderFriends}
            </ul>
        </div>
    </div>
}
