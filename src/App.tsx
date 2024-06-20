import Game from './Game';
import { AuthProvider } from './AuthContext';
import '../src/firebaseConfig';

export default function App() {
  return <AuthProvider>
    <Game />
  </AuthProvider>;
}