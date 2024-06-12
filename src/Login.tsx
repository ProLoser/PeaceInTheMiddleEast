import { useEffect } from 'react';
// import firebase from 'firebase/compat/app';
import {getAuth} from 'firebase/auth';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css';

const Login = () => {
    // Initialize FirebaseUI
    useEffect(() => {
        const uiConfig = {
            signInSuccessUrl: '/', // Redirect after successful login
            signInOptions: [
                // firebase.auth.EmailAuthProvider.PROVIDER_ID,
                // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
        };
        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(getAuth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }, []);

    return <div id="firebaseui-auth-container"></div>
};

export default Login;