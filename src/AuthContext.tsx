import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// React context for the auth state
export const AuthContext = createContext<firebase.User|null>(null);

// Provider component for the auth context
export function AuthProvider({ children }: { children: ReactNode}) {
    const [user, setUser] = useState<firebase.User|null>(null);

    useEffect(() => {
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
            setUser(user);
        });
        return () => unregisterAuthObserver();
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use the auth context
export function useAuth() {
    return useContext(AuthContext);
}