import { gql } from 'apollo-server-micro';

/**
 * Type definition for GraphQL server
 * Loosely represent CycloneDX specification (https://cyclonedx.org/)
 */
export const typeDefs = gql`
  type Component {
    id: ID @id
    project: [Project!]! @relationship(type: "BELONGS_TO", direction: OUT)
    purl: String
    name: String
    type: String
    version: String
    author: String
    publisher: String
    dependsOnCount: Int
      @cypher(
        statement: """
        CALL apoc.neighbors.tohop.count(this, 'DEPENDS_ON>',100000)
        YIELD value
        RETURN value
        """
      )
    dependsOn: [Component!]! @relationship(type: "DEPENDS_ON", direction: OUT)
    references: [Reference!]! @relationship(type: "HAS_REFERENCE", direction: OUT)
    vulnerabilities: [Vulnerability!]! @relationship(type: "HAS_VULNERABILITY", direction: OUT)
    indirectVulnCount: Int
      @cypher(
        statement: """
        MATCH (v:Vulnerability)
        CALL apoc.algo.dijkstra(this,v, "DEPENDS_ON>|HAS_VULNERABILITY>", "count",1)
        YIELD weight
        RETURN count(weight)
        """
      )
  }

  type Vulnerability {
    id: String @unique
    cve: String @unique
    ghsa: String @unique
    name: String
    description: String
    affectedVersions: String
    cvssScore: Float
    cvssVector: String
    cwe: String
    references: [Reference!]! @relationship(type: "HAS_REFERENCE", direction: OUT)
  }

  type Project {
    id: ID @id
    name: String
    version: String
    allComponents: [Component!]!
      @cypher(
        statement: """
        MATCH (this)-->(c)-[:DEPENDS_ON*]->(c2)
        WITH collect(c) + collect(c2) as all
        UNWIND all as single
        RETURN  distinct single
        """
      )
    allVulnerableComponents: [Component!]!
      @cypher(
        statement: """
        MATCH a=(v:Vulnerability)<-[:HAS_VULNERABILITY]-(c1:Component)<-[:DEPENDS_ON*]-(c2)<-[:DEPENDS_ON]-(this)
        WITH NODES(a) AS nodes
        UNWIND nodes AS n
        WITH n
        WHERE 'Component' IN LABELS(n)
        RETURN distinct n;
        """
      )
    component: [Component!]! @relationship(type: "DEPENDS_ON", direction: OUT)
    date: Date
  }

  type Reference {
    url: String @unique
  }
`;
