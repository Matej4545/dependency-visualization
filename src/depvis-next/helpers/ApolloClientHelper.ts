import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { env } from 'process';

export const createApolloClient = () => {
  const link = new HttpLink({
    uri: 'http://localhost:3000/api/graphql',
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
