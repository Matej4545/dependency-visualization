import { env } from "process";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

export const setCorsPolicy = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  const origin = process.env.CORS_ORIGIN || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

/**
 * Neo4j configuration settings
 * Use .env file to provide custom values!
 */
const IsGQLDevToolsEnabled = env.GQL_ALLOW_DEV_TOOLS === "true";

export const GetNeo4JConfig = () => {
  return {
    neo4jHost: env.NEO4J_HOST || "neo4j://localhost:7687",
    neo4jUsername: env.NEO4J_USER || "neo4j",
    neo4jPassword: env.NEO4J_PASSWORD || "",
    introspection: IsGQLDevToolsEnabled,
    plugins: IsGQLDevToolsEnabled
      ? [ApolloServerPluginLandingPageGraphQLPlayground]
      : [],
  };
};
