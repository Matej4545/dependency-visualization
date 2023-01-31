import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

/**
 * Function responsible for initialization of new Apollo Client used for GraphQL
 * @returns ApolloClient object
 */
export const createApolloClient = () => {
  const link = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GQL_URI,
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
