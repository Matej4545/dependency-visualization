import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const createApolloClient = () => {
  const link = new HttpLink({
    uri: "http://localhost:3000/api/graphql/",
  });
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
