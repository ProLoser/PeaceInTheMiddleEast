// TODO: Upgrade to modular after firebaseui upgrades
import firebase from 'firebase/compat/app';
// import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDSTc5VVNNT32jRE4m8qr7hVbI8ahaIsRc",
    authDomain: "peaceinthemiddleeast.firebaseapp.com",
    databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
    projectId: "peaceinthemiddleeast",
    storageBucket: "peaceinthemiddleeast.appspot.com",
    messagingSenderId: "529824094542",
    appId: "1:529824094542:web:eadc5cf0dc140a2b0de61f",
    measurementId: "G-NKGPNTLDF1"
};

export default firebase.initializeApp(firebaseConfig);
