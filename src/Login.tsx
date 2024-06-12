import { useEffect } from 'react';
import app from './firebaseConfig'
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css';

const Login = ({ show }) => {
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
        // var ui = new firebaseui.auth.AuthUI(getAuth());
        var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth(app));
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }, []);

    return <div style={{display:show?'block':'none'}} id="firebaseui-auth-container"></div>
};

export default Login;