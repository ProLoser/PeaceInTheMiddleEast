// Import FirebaseAuth and firebase.
import { useState, useCallback, useRef, ReactNode, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChangeEventHandler, PointerEvent } from 'react';
import { formatDistance } from 'date-fns';
import { DialogContext } from '.';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { User, Match, SnapshotOrNullType, Modal } from '../Types';
import Avatar from '../Avatar';
import './Friends.css'
import ToggleFullscreen from './ToggleFullscreen';
import { saveFcmToken } from '../firebase.config';
import Version from './Version';

type Users = { [key: string]: User }

type FriendsProps = {
    user: SnapshotOrNullType;
    friend?: User;
    load: (userId: string, key: string) => void;
    reset: () => void;
}

export default function Friends({ user, load, reset, friend }: FriendsProps) {
    const { t } = useTranslation();
    const { toggle } = useContext(DialogContext)!;

    const searchRef = useRef<HTMLInputElement>(null);
    const [users, setUsers] = useState<Users>({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [matches, setMatches] = useState<firebase.database.DataSnapshot | null>(null);
    const [searchResults, setSearchResults] = useState<firebase.database.DataSnapshot | null>(null);

    // Synchronize Matches
    useEffect(() => {
        if (!user) return;

        const queryMatches = firebase.database().ref(`matches/${user.key}`).orderByChild('sort').limitToLast(100);
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
    }, [user]);

    const onSearch: ChangeEventHandler<HTMLInputElement> = useCallback(async () => {
        if (searchRef.current?.value) {
            const search = searchRef.current.value
            const searchSnapshot = await firebase.database().ref('users').orderByChild('search').startAt(search.toLocaleLowerCase()).get();
            setSearchResults(searchSnapshot)
        } else {
            setSearchResults(null)
        }
    }, []);

    if (!user) return null;

    const renderFriends: ReactNode[] = []
    const friends: string[] = []

    const NOW = new Date()

    const handleLoad = useCallback((userId: string) => {
        if (!user?.key) return;
        load(userId, user.key);
        toggle(false);
    }, [load, user?.key, toggle]);

    const handleReset = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        reset();
        toggle(false);
    }, [reset, toggle]);

    const row = (user: User, match?: Match) => 
        <li key={user.uid} onPointerUp={() => handleLoad(user.uid)}>
            <Avatar user={user} />
            <div>
                <h3>{user.name}</h3>
                <time>{match?.sort && formatDistance(new Date(match.sort), NOW, { addSuffix: true })}</time>
                {match?.lastMessage}
            </div>
        </li>

    const searchReject = (user: User) =>
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
    searchResults?.forEach(result => {
        const resultData: User = result.val()
        if (result.key === user.key || friends.includes(result.key) || searchReject(resultData)) {
            return;
        }
        renderFriends.push(row(resultData))
    })

    const invite = () => {
        if (user.key) {
            const shareUrl = (new URL(user.key, location.href)).toString()
            navigator.clipboard?.writeText?.(shareUrl)
            navigator.share?.({
                url: shareUrl,
                title: t('inviteFriend', { name: user.val().name })
            }).catch((error) => {
                // Handle sharing cancellation or other errors
                console.error('Error sharing:', error);
            });
        }
    }

    return <section id="friends">
        <header>
            <button
                aria-haspopup="menu"
                aria-expanded={isExpanded}
                onPointerUp={() => setIsExpanded(!isExpanded)}
                className="material-icons notranslate"
            >
                settings
            </button>
            <menu>
                <li>
                    <a onPointerUp={invite} href="#">
                        <span className="material-icons notranslate">person_add_alt_1</span>
                        {t('addFriend')}
                    </a>
                </li>
                {document.fullscreenEnabled ?
                    <li>
                        <ToggleFullscreen />
                    </li>
                    : null}
                <li>
                    <a onPointerUp={() => toggle(Modal.Profile)} href="#">
                        <span className="material-icons notranslate">manage_accounts</span>
                        {t('profile')}
                    </a>
                </li>
                {"Notification" in self && Notification.permission === 'default' ? <li>
                    <a onPointerUp={() => saveFcmToken(true)} href="#">
                        <span className="material-icons notranslate">notifications</span>
                        {t('notifications')}
                    </a>
                </li> : null}
                <li>
                    <a onPointerUp={handleReset} href="#">
                        <span className="material-icons notranslate">restart_alt</span>
                        {t('reset')}
                    </a>
                </li>
                <li>
                    <a href="https://github.com/ProLoser/PeaceInTheMiddleEast/issues/new" target="_blank">
                        <span className="material-icons notranslate">bug_report</span>
                        {t('reportBug')}
                    </a>
                </li>
                <li>
                    <a href="https://github.com/ProLoser/PeaceInTheMiddleEast/" target="_blank" rel="noopener noreferrer">
                        <span className="material-icons notranslate">info</span>
                        {t('about')}
                    </a>
                </li>
                <Version />
                <li>
                    <a onPointerUp={() => firebase.auth().signOut()} href="#">
                        <span className="material-icons notranslate">logout</span>
                        {t('signOut')}
                    </a>
                </li>
            </menu>
            <h1>
                <span>
                    <span>{user.val().name}'s</span>
                    {t('friends')}
                </span>
            </h1>
        </header>
        <input name="search" ref={searchRef} type="search" autoComplete="off" placeholder={t('search')} onChange={onSearch} />
        <ul>
            {friend ? <li className="local">
                <a href={`${location.origin}/${location.pathname.split('/').filter(Boolean).slice(0, -1).join('/')}`}>
                    <span className="material-icons notranslate">local</span>
                    {t('local')}
                </a>
            </li> : null}
            {renderFriends}
        </ul>
    </section>
}
