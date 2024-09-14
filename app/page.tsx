import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Socket.IO server
    fetch('/api/socket');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;