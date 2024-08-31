import Game from './Game';
import { AuthProvider } from './AuthContext';
import { MultiplayerProvider } from './MultiplayerContext';
import '../src/firebaseConfig';

export default function App() {
  return <AuthProvider>
    <MultiplayerProvider>
      <Game />
    </MultiplayerProvider>
  </AuthProvider>;
}
