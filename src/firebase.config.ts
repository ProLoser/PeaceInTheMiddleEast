
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import 'firebase/compat/database';
import 'firebase/compat/auth';

export const config = {
    apiKey: "AIzaSyAJ-hHh7fs0aOMR6Zqe0Wu_z_y1j9Ivgos",
    // authDomain: "peaceinthemiddleeast.firebaseapp.com",
    authDomain: "backgammon.family",
    databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
    projectId: "peaceinthemiddleeast",
    storageBucket: "peaceinthemiddleeast.firebasestorage.app",
    messagingSenderId: "529824094542",
    appId: "1:529824094542:web:eadc5cf0dc140a2b0de61f",
    measurementId: "G-NKGPNTLDF1"
};

const vapidKey = 'BM1H9qfv1e_XcIB31ZeLCn8IpGOdMIwMShRej6wld8QAMkV4YqJ-eMQa1rSnwhkmVmAFw3tvUdlP2JzZmgTq4Fk';

export default firebase.initializeApp(config);

export async function saveFcmToken(requestPermission = false) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    if (!('Notification' in window)) {
        console.log("Notifications are not supported in this browser.");
        return;
    }

    if (Notification.permission === 'default' && requestPermission) {
        await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
        const token = await firebase.messaging().getToken({ vapidKey });
        if (!token) return;
        
        await firebase.database().ref(`/users/${userId}/fcmTokens/${token}`).set({
            ts: firebase.database.ServerValue.TIMESTAMP,
            ua: navigator.userAgent || 'unknown'
        });
    }
}
