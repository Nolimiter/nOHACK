import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { GameProvider } from '../contexts/GameContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GameProvider>
        <Component {...pageProps} />
      </GameProvider>
    </AuthProvider>
  );
}

export default MyApp;