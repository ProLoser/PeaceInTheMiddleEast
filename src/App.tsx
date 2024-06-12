import Game from './Game';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in:', user);
      } else {
        // User is signed out
        console.log('User is signed out');
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  return <Game />;
}