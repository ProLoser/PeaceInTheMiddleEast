import Game from './Game';
import { useEffect, useState } from 'react';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const auth = getAuth();
  const [user, setUser] = useState<User|null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // var displayName = user.displayName;
  // var photoURL = user.photoURL;
  // var uid = user.uid;
  return <Game />;
}