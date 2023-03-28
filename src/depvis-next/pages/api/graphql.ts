import { Neo4jGraphQL } from "@neo4j/graphql";
import { ApolloServer } from "apollo-server-micro";
import neo4j from "neo4j-driver";
import {
  GetNeo4JConfig,
  setCorsPolicy,
} from "../../helpers/ApolloServerHelper";
import { typeDefs } from "../../types/gqlTypes";

export const gqlUrlPath = "/api/graphql";

const NEO4J_CONFIG = GetNeo4JConfig();

const driver = neo4j.driver(
  NEO4J_CONFIG.neo4jHost,
  neo4j.auth.basic(NEO4J_CONFIG.neo4jUsername, NEO4J_CONFIG.neo4jPassword)
);

async function handler(req, res) {
  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const schema = await neoSchema.getSchema();
  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });
  const apolloServer = new ApolloServer({
    schema: schema,
    introspection: NEO4J_CONFIG.introspection,
    plugins: NEO4J_CONFIG.plugins,
    cache: "bounded",
  });
  await apolloServer.start();
  await apolloServer.createHandler({
    path: gqlUrlPath,
  })(req, res);
}

export default setCorsPolicy(handler);
export const config = {
  api: {
    bodyParser: false,
  },
};
