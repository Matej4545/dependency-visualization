export enum CypherNodeTypes {
  'Project',
  'Component',
}

export enum CypherRelationshopTypes {
  'depends_on',
  'belongs_to',
}

/** Provides queries for Neo4J Database */
export class CypherQueryHelper {
  mergeProjectQuery = `MERGE (p:${CypherNodeTypes[CypherNodeTypes.Project]} {
                                    name: $name,
                                    version: $version,
                                    purl: $purl,
                                    type: $type
                                }) RETURN p`;

  mergeComponentQuery = `MERGE (c:${CypherNodeTypes[CypherNodeTypes.Component]} {
                                    name: $name,
                                    version: $version,
                                    purl: $purl,
                                    type: $type
                                }) RETURN c`;

  createDependencyQuery = `MATCH (p:${CypherNodeTypes[CypherNodeTypes.Project]} {
                                    purl: $project
                                }) MATCH (d1 {
                                    purl: $d1
                                }) MATCH (d2:${CypherNodeTypes[CypherNodeTypes.Component]} {
                                    purl: $d2
                                }) MERGE (d1)-[:${
                                  CypherRelationshopTypes[CypherRelationshopTypes.depends_on]
                                }]->(d2)-[:${CypherRelationshopTypes[CypherRelationshopTypes.belongs_to]}]->(p) 
                                RETURN d1, d2`;

  getComponentWithNeighboursQuery = `MATCH c=(:${CypherNodeTypes[CypherNodeTypes.Component]} {
                                                        purl: $purl
                                                    })-[:${CypherRelationshopTypes.depends_on}]-() RETURN P`;

  getProjectsQuery = `MATCH (p:${CypherNodeTypes[CypherNodeTypes.Project]}) RETURN p`;
}
