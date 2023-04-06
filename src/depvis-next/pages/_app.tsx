import { ApolloProvider } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import SSRProvider from "react-bootstrap/SSRProvider";
import { useApollo } from "../apollo/ApolloClient";
import { Layout } from "../components/Layout/Layout";
import "../styles/custom.css";
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.js");
  }, []);
  const apolloClient = useApollo();
  return (
    <ApolloProvider client={apolloClient}>
      <SSRProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SSRProvider>
    </ApolloProvider>
  );
}

export default MyApp;
