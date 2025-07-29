// TODO: Cleanup this file 
// https://github.com/firebase/firebaseui-web-react/pull/173#issuecomment-1151532176
import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';
import * as firebaseui from 'firebaseui';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import ToggleFullscreen from './ToggleFullscreen';
import './Login.css';
import { DialogContext } from '.';
import { User } from '../Types';
import Version from './Version';

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID, // Requires Billing
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID, // Requires Facebook App ID
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
    },
};

type LoginProps = {
    reset: () => void;
    friend?: User;
    load: () => void;
};

export default function Login({ reset, friend, load }: LoginProps) {
    const { t } = useTranslation();
    const [userSignedIn, setUserSignedIn] = useState(false);
    const elementRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const { toggle } = useContext(DialogContext)!;

    useEffect(() => {
        // Get or Create a firebaseUI instance.
        const firebaseUiWidget = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
        if (uiConfig.signInFlow === 'popup')
            firebaseUiWidget.reset();

        // We track the auth state to reset firebaseUi if the user signs out.
        const unregisterAuthObserver = onAuthStateChanged(firebase.auth(), (user) => {
            if (!user && userSignedIn)
                firebaseUiWidget.reset();
            setUserSignedIn(!!user);
        });

        // Render the firebaseUi Widget.
        // @ts-ignore
        firebaseUiWidget.start(elementRef.current, uiConfig);

        return () => {
            unregisterAuthObserver();
            firebaseUiWidget.reset();
        };
    }, [firebaseui, uiConfig]);

    const decline = useCallback(() => {
        load()
        toggle(false)
    }, [load]);

    return (
        <section id="login">
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
                    {document.fullscreenEnabled ?
                        <li>
                            <ToggleFullscreen />
                        </li>
                        : null}
                    <li>
                        <a onPointerUp={reset} href="#">
                            <span className="material-icons notranslate">restart_alt</span>
                            {t('newGame')}
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
                            {t('info')}
                        </a>
                    </li>
                    <Version />
                </menu>
                <h1>{t('login')} {friend?.name || t('guest')}</h1>
            </header>
            <div ref={elementRef} />
            {friend ? <>
                <h1>{t('login')}</h1>
                <button className="local" onPointerUp={decline}>{t('local')}</button>
            </>:null}
        </section>
    );
}
