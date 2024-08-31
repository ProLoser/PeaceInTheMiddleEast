import { createContext, useEffect, useState, PropsWithChildren } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// React context for the auth state
export const AuthContext = createContext<firebase.database.DataSnapshot|null>(null);

export type UserData = {
    uid: string;
    name: string;
    photoURL: string | null;
    language: string;
}

// Provider component for the auth context
export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<firebase.database.DataSnapshot|null>(null);

    useEffect(() => {
        // onAuthStateChanged
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                const userRef = firebase.database().ref(`users/${user.uid}`)
                let snapshot = await userRef.get()
                if (!snapshot.exists()) {
                    // Upload initial user data
                    const data: UserData = {
                        uid: user.uid,
                        name: user.displayName || user.uid,
                        photoURL: user.photoURL,
                        language: navigator.language,
                    };
                    console.log('Creating user', data);
                    userRef.set(data);
                    snapshot = await userRef.get()
                }
                setUser(snapshot);
            } else {
                setUser(null);
            }
        });
        return () => unregisterAuthObserver();
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}