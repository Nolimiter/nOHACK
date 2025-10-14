import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';
import { GameProvider } from '../contexts/GameContext';

function MyApp({ Component, pageProps }: AppProps) {
  const { session, ...restPageProps } = pageProps;
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <GameProvider>
          <Component {...restPageProps} />
        </GameProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;