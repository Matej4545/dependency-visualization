import neo4j, { Driver } from "neo4j-driver";
import { env } from "process";

export const GraphQLUri = "/api/graphql";

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

const GetNeo4JConfig = () => {
  return {
    uri: env.NEO4J_HOST,
    username: env.NEO4J_USER,
    password: env.NEO4J_PASSWORD,
  };
};

let driver: Driver;
export const getDriver = () => {
  const { uri, username, password } = GetNeo4JConfig();
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return driver;
};
