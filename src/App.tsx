import Game from './Game';
import Online, { Provider as OnlineProvider } from './Online';

import './Online/firebaseConfig';

export default function App() {
  return (
    <OnlineProvider>
      <Game />
      <Online />
    </OnlineProvider>
  );
}
