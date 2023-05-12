import { ApolloProvider } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import { useEffect } from "react";
import SSRProvider from "react-bootstrap/SSRProvider";
import { useApollo } from "../apollo/ApolloClient";
import { Layout } from "../components/Layout/Layout";
import "../styles/custom.css";

/**
 * Application root function
 * Contains wrappers for ApolloProvider, SSR and enforces the layout
 */
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.js");
  }, []);
  const apolloClient = useApollo();
  return (
    <ApolloProvider client={apolloClient}>
      <SSRProvider>
        <Layout>
          <Head>
            <title>DepVis</title>
          </Head>
          <Component {...pageProps} />
        </Layout>
      </SSRProvider>
    </ApolloProvider>
  );
}

export default MyApp;
