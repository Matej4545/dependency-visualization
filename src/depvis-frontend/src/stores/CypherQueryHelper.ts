export enum CypherNodeTypes {
    'Project',
    'Component'
}

export enum CypherRelationshopTypes {
    'depends_on',
    'belongs_to'
}

/** Provides queries for Neo4J Database */
export class CypherQueryHelper {
    mergeProjectQuery = () => {return `MERGE (p:${CypherNodeTypes.Project} {
                                    name: $name,
                                    version: $version,
                                    purl: $purl
                                }) RETURN p`}

    mergeComponentQuery = () => {return `MERGE (c:${CypherNodeTypes.Component} {
                                    name: $name,
                                    version: $version,
                                    purl: $purl
                                }) RETURN c`}

    createDependencyQuery = () => {return `MATCH (p:${CypherNodeTypes.Project} {
                                    purl: $project
                                }) MATCH (d1 {
                                    purl: $d1
                                }) MATCH (d2:${CypherNodeTypes.Component} {
                                    purl: $d2
                                }) MERGE (d1)-[:${CypherRelationshopTypes.depends_on}]->(d2)-[:${CypherRelationshopTypes.belongs_to}]->(p) 
                                RETURN d1, d2`}

    getComponentWithNeighboursQuery = () => {return `MATCH c=(:${CypherNodeTypes.Component} {
                                                        purl: $purl
                                                    })-[:${CypherRelationshopTypes.depends_on}]-() RETURN P`}

    getProjectsQuery = () => {return `MATCH (p:${CypherNodeTypes[CypherNodeTypes.Project]}) RETURN p`}
}

