import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { gqlUrlPath } from '../pages/api/graphql';

/**
 * Function responsible for initialization of new Apollo Client used for GraphQL
 * @returns ApolloClient object
 */
export const createApolloClient = () => {
  const uri = gqlUrlPath;
  const link = new HttpLink({
    uri: uri,
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
