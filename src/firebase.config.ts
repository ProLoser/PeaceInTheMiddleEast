
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import 'firebase/compat/database';
import 'firebase/compat/auth';

export const config = {
    apiKey: "AIzaSyDSTc5VVNNT32jRE4m8qr7hVbI8ahaIsRc",
    authDomain: "peaceinthemiddleeast.firebaseapp.com",
    databaseURL: "https://peaceinthemiddleeast-default-rtdb.firebaseio.com",
    projectId: "peaceinthemiddleeast",
    storageBucket: "peaceinthemiddleeast.appspot.com",
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
        
        // Generate a unique device ID if not already stored
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('deviceId', deviceId);
        }
        
        // Store token in the new fcmTokens structure
        await firebase.database().ref(`/users/${userId}/fcmTokens/${deviceId}`).set(token);
        
        // Also store in legacy fcmToken for backward compatibility (can be removed later)
        await firebase.database().ref(`/users/${userId}/fcmToken`).set(token);
    }
}