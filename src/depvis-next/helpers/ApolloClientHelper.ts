import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import urlJoin from "url-join";
import { gqlUrlPath } from "../pages/api/graphql";
import { getAPIBaseUrl } from "./RequestHelper";

/**
 * Function responsible for initialization of new Apollo Client used for GraphQL
 * @returns ApolloClient object
 */
export const createApolloClient = () => {
  const uri = urlJoin(getAPIBaseUrl(), gqlUrlPath);
  const link = new HttpLink({
    uri: uri,
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
