import { Neo4jGraphQL } from "@neo4j/graphql";
import { typeDefs } from "../types/gqlTypes";
import { getDriver } from "./ApolloServer";

const driver = getDriver();
export const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
