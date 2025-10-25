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
import SettingsIcon from '@material-design-icons/svg/filled/settings.svg?react';
import PersonAddIcon from '@material-design-icons/svg/filled/person_add_alt_1.svg?react';
import ManageAccountsIcon from '@material-design-icons/svg/filled/manage_accounts.svg?react';
import NotificationsIcon from '@material-design-icons/svg/filled/notifications.svg?react';
import RestartAltIcon from '@material-design-icons/svg/filled/restart_alt.svg?react';
import BugReportIcon from '@material-design-icons/svg/filled/bug_report.svg?react';
import InfoIcon from '@material-design-icons/svg/filled/info.svg?react';
import LogoutIcon from '@material-design-icons/svg/filled/logout.svg?react';
import LocalIcon from '@material-design-icons/svg/filled/location_on.svg?react';

type Users = { [key: string]: User }

type FriendsProps = {
    user: SnapshotOrNullType;
    friend?: User;
    load: (userId: string | false, key: string) => void;
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

    const handleLoad = useCallback((userId: string | false) => {
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

    const invite = (event: PointerEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (user.key) {
            const url = (new URL(user.key, location.href)).toString()
            const name = user.val().name
            const invitation = t('invitation', { name })
            navigator.clipboard?.writeText?.(`${invitation}: ${url}`)
            navigator.share?.({
                url,
                title: t('inviteFriend'),
                text: invitation
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
            >
                <SettingsIcon className="material-icons-svg notranslate" />
            </button>
            <menu>
                <li>
                    <a onPointerUp={invite} href="#">
                        <PersonAddIcon className="material-icons-svg notranslate" />
                        {t('addFriend')}
                    </a>
                </li>
                {document.fullscreenEnabled ?
                    <li>
                        <ToggleFullscreen />
                    </li>
                    : null}
                <li>
                    <a onPointerUp={(e) => { e.preventDefault(); toggle(Modal.Profile); }} href="#">
                        <ManageAccountsIcon className="material-icons-svg notranslate" />
                        {t('profile')}
                    </a>
                </li>
                {"Notification" in self && Notification.permission === 'default' ? <li>
                    <a onPointerUp={(e) => { e.preventDefault(); saveFcmToken(true); }} href="#">
                        <NotificationsIcon className="material-icons-svg notranslate" />
                        {t('notifications')}
                    </a>
                </li> : null}
                <li>
                    <a onPointerUp={handleReset} href="#">
                        <RestartAltIcon className="material-icons-svg notranslate" />
                        {t('reset')}
                    </a>
                </li>
                <li>
                    <a href="https://github.com/ProLoser/PeaceInTheMiddleEast/issues/new" target="_blank">
                        <BugReportIcon className="material-icons-svg notranslate" />
                        {t('reportBug')}
                    </a>
                </li>
                <li>
                    <a href="https://github.com/ProLoser/PeaceInTheMiddleEast/" target="_blank" rel="noopener noreferrer">
                        <InfoIcon className="material-icons-svg notranslate" />
                        {t('about')}
                    </a>
                </li>
                <Version />
                <li>
                    <a onPointerUp={(e) => { e.preventDefault(); firebase.auth().signOut(); }} href="#">
                        <LogoutIcon className="material-icons-svg notranslate" />
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
            {friend ? <li onPointerUp={() => handleLoad(false)}>
                <LocalIcon className="material-icons-svg notranslate" />
                <h3>
                    {t('local')}
                </h3>
            </li> : null}
            {renderFriends}
        </ul>
    </section>
}
