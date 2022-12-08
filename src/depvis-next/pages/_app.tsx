import { ApolloProvider } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import SSRProvider from "react-bootstrap/SSRProvider";
import { Layout } from "../components/Layout/Layout";
import { createApolloClient } from "../helpers/ApolloClientHelper";
import "../styles/custom.css";
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.js");
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
