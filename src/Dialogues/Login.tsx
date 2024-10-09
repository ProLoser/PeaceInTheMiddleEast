// TODO: Cleanup this file 
// https://github.com/firebase/firebaseui-web-react/pull/173#issuecomment-1151532176
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';
import * as firebaseui from 'firebaseui';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import ToggleFullscreen from '../ToggleFullscreen';

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

interface Props {
    // The Firebase UI Web UI Config object.
    // See: https://github.com/firebase/firebaseui-web#configuration
    uiConfig: firebaseui.auth.Config;
    // Callback that will be passed the FirebaseUi instance before it is
    // started. This allows access to certain configuration options such as
    // disableAutoSignIn().
    uiCallback?(ui: firebaseui.auth.AuthUI): void;
    // The Firebase App auth instance to use.
    firebaseAuth: any; // As firebaseui-web
    className?: string;
}


export default function Login({ reset }) {
    const [userSignedIn, setUserSignedIn] = useState(false);
    const elementRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <section id="login">
            <header>
                <button
                    aria-haspopup="menu"
                    aria-expanded={isExpanded}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="material-icons"
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
                        <a onClick={reset}>
                            <span className="material-icons">restart_alt</span>
                            Reset Match
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/ProLoser/PeaceInTheMiddleEast/issues/new" target="_blank">
                            <span className="material-icons">bug_report</span>
                            Report Bug
                        </a>
                    </li>
                </menu>
                <h1>Play Online</h1>
            </header>
            <div ref={elementRef} />
        </section>
    );
}