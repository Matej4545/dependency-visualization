import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { GraphQLUri } from "./ApolloServer";
import { useMemo } from "react";
import urlJoin from "url-join";

let httpApolloClient;
let ssrApolloClient;
const ssrHttpLink = createHttpLink({
  uri: urlJoin(process.env.NEXT_PUBLIC_SERVER_URI, GraphQLUri),
  credentials: "same-origin",
  fetchOptions: {
    mode: "cors",
  },
});
const httpLink = createHttpLink({
  uri: GraphQLUri,
  credentials: "same-origin",
  fetchOptions: {
    mode: "cors",
  },
});

const createHttpApolloClient = (ssr: boolean = false) => {
  const link = ssr ? ssrHttpLink : httpLink;
  console.log("Creating new Apollo Client (ssr: %s)", ssr);
  return new ApolloClient({
    ssrMode: ssr,
    link: ssr ? ssrHttpLink : httpLink,
    cache: new InMemoryCache(),
  });
};

export function initializeHttpApollo() {
  let _apolloClient;

  if (typeof window === "undefined") {
    _apolloClient = ssrApolloClient ?? createHttpApolloClient(true);
    if (!ssrApolloClient) ssrApolloClient = _apolloClient;
  } else {
    _apolloClient = httpApolloClient ?? createHttpApolloClient();
    if (!httpApolloClient) httpApolloClient = _apolloClient;
  }
  return _apolloClient;
}

export function useApollo() {
  const store = useMemo(() => initializeHttpApollo(), []);
  return store;
}
