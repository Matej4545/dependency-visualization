import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import urlJoin from 'url-join';
import { gqlUrlPath } from '../pages/api/graphql';

/**
 * Function responsible for initialization of new Apollo Client used for GraphQL
 * @returns ApolloClient object
 */
export const createApolloClient = () => {
  const uri = urlJoin(process.env.NEXT_PUBLIC_SERVER_URI || 'http://localhost:3000', gqlUrlPath);
  console.log(`Creating GQL Client (connection to ${uri})`)
  const link = new HttpLink({
    uri: uri,
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
