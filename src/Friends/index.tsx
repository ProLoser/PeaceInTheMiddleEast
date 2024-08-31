// Import FirebaseAuth and firebase.
import { useState, useCallback, useRef, useContext, ReactNode } from 'react';
import type { ChangeEventHandler } from 'react';
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from '../StyledFirebaseAuth';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AuthContext, UserData } from '../AuthContext';
import './index.css'
import { MultiplayerContext, ChatContext, Match } from '../MultiplayerContext';

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
    },
};


type AvatarProps = {
    user: UserData;
}
const Avatar = ({ user }: AvatarProps) => 
    user 
        ? <img src={user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} alt={user.name} />
        : <img src="https://i.pravatar.cc/100" />

type FriendsProps = {
    show?: boolean;
}
export default function Friends({ show }: FriendsProps) {
    const searchRef = useRef<HTMLInputElement>(null);
    const authUserSnapshot = useContext(AuthContext); // Local signed-in state.
    const { matches, users, load } = useContext(MultiplayerContext);
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const chat = useContext(ChatContext);

    const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(async() => {
        if (!authUserSnapshot || !searchRef.current?.value) return;
        const search = searchRef.current.value
        const searchSnapshot = await firebase.database().ref('users').orderByChild('name').startAt(search).get();
        const results: UserData[] = []
        searchSnapshot.forEach(result => {
            results.push(result.val())
        })
        setSearchResults(results)
    }, [authUserSnapshot]);

    if (!show) return null;

    const renderMatches: ReactNode[] = []
    matches?.forEach(match => {
        const matchData: Match = match.val()
        renderMatches.push(
            <li key={match.key} onClick={() => load(match.key)}>
                <Avatar user={users[match.key]} />
                <small style={{float:'right'}}>{matchData.sort}</small>
                <strong>
                    {users[match.key]?.name}:
                </strong>
                {matchData.lastMessage}
            </li>
        )
    })

    const renderChat: ReactNode[] = []
    chat?.forEach(message => {
        renderChat.push(
            <li key={message.key} onClick={() => load(message.key)}>
                {message.val().name}
            </li>
        )
    })

    return authUserSnapshot ? (
        <div id="friends" className='modal'>
            <h1>Matches</h1>
            <a onClick={() => firebase.auth().signOut()}>Sign-out: </a>
            <span>{authUserSnapshot.key}</span>
            <input name="search" ref={searchRef} type="search" placeholder="Search for Friends" onChange={onSearch} />
            <ul>
                {searchResults.map( user => 
                    <li key={user.uid}>
                        <a onClick={() => load(user.uid)}>
                            <Avatar user={user} />
                            {user.name}
                        </a>
                    </li>
                )}
                {renderMatches}
            </ul>
            {/* {chat && (
                <div>
                    <h2>{users[chat].name}</h2>
                    {renderChat}
                </div>
            )} */}
        </div>
    ) : (
        <div id="friends" className='modal'>
            <h1>Play Online</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
}
