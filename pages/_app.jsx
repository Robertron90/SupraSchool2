import React from 'react';
import 'antd/dist/antd.css';
import './styles.css';
import { ApolloProvider } from '@apollo/client';
import { client } from '../src/api';
import dynamic from 'next/dynamic';

const ZoomProvider = dynamic(import('../src/components/ZoomProvider'), {
  ssr: false,
});

function MyApp({ Component, pageProps }) {
  return (
    <ZoomProvider>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ZoomProvider>
  );
}
export default MyApp;
