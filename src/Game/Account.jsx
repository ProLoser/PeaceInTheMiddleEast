import 'react'
import './Account.css'

// https://firebase.google.com/docs/auth/web/anonymous-auth?hl=en&authuser=0

import { getAuth, signInAnonymously } from "firebase/auth";

const auth = getAuth();

const firebaseConfig = {
    apiKey: "AIzaSyD1-5s4lK7YyY5tW1oTg4F5xq4Cf1X8iM4",
    authDomain: "mygame-9f4b0.firebaseapp.com",
    projectId: "mygame-9f4b0",
    storageBucket: "mygame-9f4b0.appspot.com",
    messagingSenderId: "554878081473",
    appId: "1:554878081473:web:9f0d9a1e0d3f7d5f3a1b9e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
// const db = firebase.firestore();

function signIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
}

function signUp(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // ..
        });
}

// auth.signOut()

// auth.sendPasswordResetEmail(email)


export default function Account() {
    return <div id="account">
        <h3>Account</h3>
        <a onClick={signIn}>Sign In</a>
        <a>Sign Up</a>
        
    </div>
}