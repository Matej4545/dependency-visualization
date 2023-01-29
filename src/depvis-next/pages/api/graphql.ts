import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import neo4j from 'neo4j-driver';
import { env } from 'process';
import { typeDefs } from '../../types/gqlTypes';

export const gqlUrlPath = '/api/graphql';
const IsGQLDevToolsEnabled = env.GQL_ALLOW_DEV_TOOLS === 'true';

/**
 * Neo4j configuration settings
 * Use .env file to provide custom values!
 */
const NEO4J_CONFIG = {
  neo4jHost: env.NEO4J_HOST || 'neo4j://localhost:7687',
  neo4jUsername: env.NEO4J_USER || 'neo4j',
  neo4jPassword: env.NEO4J_PASSWORD || '',
  introspection: IsGQLDevToolsEnabled,
  plugins: IsGQLDevToolsEnabled ? [ApolloServerPluginLandingPageGraphQLPlayground] : [],
};

const driver = neo4j.driver(
  NEO4J_CONFIG.neo4jHost,
  neo4j.auth.basic(NEO4J_CONFIG.neo4jUsername, NEO4J_CONFIG.neo4jPassword)
);

export default async function handler(req, res) {
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const apolloServer = new ApolloServer({
    schema: await neoSchema.getSchema(),
    introspection: NEO4J_CONFIG.introspection,
    plugins: NEO4J_CONFIG.plugins,
  });
  await apolloServer.start();
  await apolloServer.createHandler({
    path: gqlUrlPath,
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
