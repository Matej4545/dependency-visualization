import { gql } from "apollo-server-micro";

/**
 * Type definition for GraphQL server
 * Loosely represent CycloneDX specification (https://cyclonedx.org/)
 */
export const typeDefs = gql`
  type Component {
    id: ID @id
    purl: String
    name: String
    type: String
    version: String
    author: String
    pubisher: String
    dependsOnCount: Int
      @cypher(
        statement: """
        CALL apoc.neighbors.tohop.count(this, 'DEPENDS_ON>',100000)
        YIELD value
        RETURN value
        """
      )
    dependsOn: [Component!]! @relationship(type: "DEPENDS_ON", direction: OUT)
    references: [Reference!]!
      @relationship(type: "HAS_REFERENCE", direction: OUT)
    vulnerabilities: [Vulnerability!]!
      @relationship(type: "HAS_VULNERABILITY", direction: OUT)
  }

  type Vulnerability {
    id: String @unique
    cve: String @unique
    ghsa: String @unique
    name: String
    description: String
    affectedVersion: String
    cvssScore: Float
    cvssVector: String
    cwe: String
    references: [Reference!]!
      @relationship(type: "HAS_REFERENCE", direction: OUT)
  }

  type Project {
    id: ID @id
    name: String
    version: String
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
    url: String @unique
  }
`;
