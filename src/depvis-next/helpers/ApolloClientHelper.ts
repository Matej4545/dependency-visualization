import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import urlJoin from "url-join";
import { gqlUrlPath } from "../pages/api/graphql";

/**
 * Function responsible for initialization of new Apollo Client used for GraphQL
 * @returns ApolloClient object
 */
export const createApolloClient = () => {
  const serverUri = !(typeof window === "object") //decide if using browser or console
    ? process.env.BACKEND_SERVER_URI
    : process.env.NEXT_PUBLIC_SERVER_URI;
  if (!serverUri) {
    console.error("No server URI was provided, using default connection");
  }
  const uri = urlJoin(serverUri || "http://localhost:3000", gqlUrlPath);
  console.log(`Creating GQL Client (connection to ${uri})`);
  const link = new HttpLink({
    uri: uri,
    fetchOptions: {
      mode: "cors",
    },
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
