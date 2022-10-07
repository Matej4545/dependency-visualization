import { Layout } from '../components/Layout/Layout';
//import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { useEffect } from 'react';
import { createApolloClient } from '../helpers/ApolloClientHelper';
import { ApolloProvider } from '@apollo/client';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.js');
  }, []);
  return (
    <ApolloProvider client={createApolloClient()}>
      <SSRProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SSRProvider>
    </ApolloProvider>
  );
}

export default MyApp;
