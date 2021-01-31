import React from 'react';
import 'antd/dist/antd.css';
import { ApolloProvider } from '@apollo/client';
import { client } from '../src/api';

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
export default MyApp;
