// Import FirebaseAuth and firebase.
import * as firebaseui from 'firebaseui';
import StyledFirebaseAuth from '../StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import { useAuth } from '../AuthContext';
import './index.css'

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

export default function Login({ show }: { show: boolean}) {
    const user = useAuth(); // Local signed-in state.
    if (!show) return null;
    return user ? (
        <div id="login">
            <h1>Online Play</h1>
            <p>Welcome {user.displayName}! You are now signed-in!</p>
            <a onClick={() => firebase.auth().signOut()}>Sign-out</a>
        </div>
    ) : (
        <div id="login">
            <h1>Online Play</h1>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        </div>
    );
}