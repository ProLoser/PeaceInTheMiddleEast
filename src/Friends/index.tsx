// Import FirebaseAuth and firebase.
import { useState, useCallback, useRef, useContext, ReactNode, useEffect } from 'react';
import type { ChangeEventHandler } from 'react';
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from '../StyledFirebaseAuth';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { AuthContext, UserData } from '../AuthContext';
import './index.css'
import { MultiplayerContext, ChatContext, FriendContext, Match } from '../MultiplayerContext';

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
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
    const friend = useContext(FriendContext);
    const { matches, users, load } = useContext(MultiplayerContext);
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const chat = useContext(ChatContext);

    const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(async() => {
        if (!searchRef.current?.value) return;
        const search = searchRef.current.value
        const searchSnapshot = await firebase.database().ref('users').orderByChild('name').startAt(search).get();
        const results: UserData[] = []
        searchSnapshot.forEach(result => {
            results.push(result.val())
        })
        setSearchResults(results)
    }, []);

    useEffect(() => {
        if (!show) setSearchResults([])
    }, [show])

    const renderFriend = friend ? <h2>{users[friend]?.name}</h2> : null

    if (!show) return renderFriend;

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
        <>
            {renderFriend}
            <div id="friends" className='modal'>
                <h1>
                    {authUserSnapshot.val().name}'s
                    Matches 
                    <a onClick={() => load(authUserSnapshot.key)}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z" />
                        </svg>
                    </a>

                </h1>
                <a onClick={() => firebase.auth().signOut()}>Sign-out: </a>
                <span>{authUserSnapshot.key}</span>
                <input name="search" ref={searchRef} type="search" placeholder="Search for Friends" onChange={onSearch} />
                <ul>
                    {searchResults.map(user =>
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
        </>
    ) : (
        <div id="friends" className='modal'>
            <h1>Play Online</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
}
