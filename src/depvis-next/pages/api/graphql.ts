import { gql, ApolloServer } from 'apollo-server-micro';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import neo4j from 'neo4j-driver';
import { Neo4jGraphQL } from '@neo4j/graphql';

const DEFAULT_DB_SETTINGS = {
  neo4jHost: process.env.NEO4J_HOST || 'neo4j://localhost:7687',
  neo4jUsername: process.env.NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.NEO4J_PASSWORD || '',
};

// Declare here to handle cold start of serverless function
let startServer;
let apolloServer;

const typeDefs = gql`
  type Component {
    id: ID
    purl: String
    name: String
    type: String
    version: String
    author: String
    pubisher: String
    deps_count: Int
      @cypher(
        statement: """
        MATCH(this)-[:DEPENDS_ON*]->(m:Component) RETURN count(m)
        """
      )
    depends_on: [Component!]! @relationship(type: "DEPENDS_ON", direction: OUT)
    references: [Reference!]! @relationship(type: "HAS_REFERENCE", direction: OUT)
    vulnerabilities: [Vulnerability!]! @relationship(type: "HAS_VULNERABILITY", direction: OUT)
  }

  type Vulnerability {
    id: ID
    name: String
    cvss: String
    affectedVersion: String
    references: [Reference!]! @relationship(type: "HAS_REFERENCE", direction: OUT)
  }

  type Project {
    id: ID
    name: String
    version: Int
    components: [Component!]!
      @cypher(
        statement: """
        MATCH (this)-->(c)-[:DEPENDS_ON*]->(c2)
        WITH collect(c) + collect(c2) as all
        UNWIND all as single
        RETURN  distinct single
        """
      )
    date: Date
  }

  type Reference {
    id: ID
    name: String
    url: String
  }
`;

//components: [Component!]! @relationship(type: "HAS_COMPONENTS", direction: OUT)

const driver = neo4j.driver(
  DEFAULT_DB_SETTINGS.neo4jHost,
  neo4j.auth.basic(DEFAULT_DB_SETTINGS.neo4jUsername, DEFAULT_DB_SETTINGS.neo4jPassword)
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

export default async function handler(req, res) {
  if (!apolloServer) {
    const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
    const schema = await neoSchema.getSchema();

    apolloServer = new ApolloServer({
      schema,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    });

    startServer = apolloServer.start();
  } else {
    await startServer;
    await apolloServer.createHandler({
      path: '/api/graphql',
    })(req, res);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
