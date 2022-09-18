import { action, makeObservable, observable } from 'mobx';
import { getDriver } from '../helpers/Neo4jHelper';
import { ISbomProject } from '../interfaces/CycloneDX';
import { Driver } from 'neo4j-driver/types/driver'
import { XMLParser } from 'fast-xml-parser'
import { CypherQueryHelper } from './CypherQueryHelper';
import neo4j from 'neo4j-driver'

/**
 * This class provides functions for working with the input SBOM file.
 */


export class SbomStore {
  /**
   * Store projects and all their components.
   */
    projects: any//Array<ISbomProject>;
  /** 
   * Indicates whether the store is loading. 
   */
    isLoading: Boolean;
      /** 
   * Indicates whether the neo4j database is connected. 
   */
    isConnected: Boolean;
  /**
   * Expose more detailed state
   */
    state: string;
  /**
   * Neo4J driver
   */
    neo4jDriver: Driver;
    /**
     * CypherQueryHelper
     */
    cqh: CypherQueryHelper;

  constructor() {
    this.projects = [];
    this.isLoading = false;
    this.neo4jDriver = getDriver();
    this.state = '';
    this.isConnected = false;
    this.cqh = new CypherQueryHelper();
    
    makeObservable(this,
      {
        isConnected: observable,
        isLoading: observable,
        state: observable,
        projects: observable,
        parseProject: action,
        loadProjects: action
      })
      this.checkConnection()
  }

  checkConnection = async () => {
    try {
      const res = await this.neo4jDriver.getServerInfo();
    } catch {
      console.error("Could not make connection to the server!")
      this.isConnected = false;
    }
    this.isConnected = true;    
  };

  parseProject = async (input: string) => {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: 'A_',
    };
    const parser = new XMLParser(options);
    try {
      this.state = "Parsing XML file"
      const obj = parser.parse(input);
      this.storeProject(obj)
    } catch (error) {
      this.state = "Error - check console"
      console.log(error)
    }
  }
  
  writeQuery = async (query: string, params: Record<string, any>) => {
    return await this.Query(query, params, {defaultAccessMode: neo4j.session.WRITE })
  }

  readQuery = async (query: string, params: Record<string, any>) => {
    return await this.Query(query, params, {defaultAccessMode: neo4j.session.READ })
  }

  Query = async (query: string, params: Record<string, any>, sessionOptions: Record<string, any> | undefined) => {
    const session = this.neo4jDriver.session(sessionOptions);
    var result = null;
    try {
      result = await session.run(query, params);
    } catch (error) {
      console.error(error);
    }
    session.close();
    console.log(result);
    return result;
  }

  storeProject = async (input: any) => {
    this.isLoading = true;
    let components = input.bom.components ? input.bom.components.component : [];
    let dependencies = input.bom.dependencies ? input.bom.dependencies.dependency : [];
    const p = input.bom.metadata ? input.bom.metadata.component : null;
    console.log({components: components, deps: dependencies, p: p})

    try {      
      this.state = `Creating project ${p.name}`
      console.log("Writing project")
    p && await this.writeQuery(this.cqh.mergeProjectQuery(), {name: p.name, version: p.version, purl: p['A_bom-ref']});

    console.log("Writing components")

    if (!(components instanceof Array)) {
      components = [components];
    }
    this.state = `Creating components - 0 of ${components.length}`
    let counter = 0;
    for await (const component of components) {
      this.state = `Creating components - ${++counter} of ${components.length}`
      await this.writeQuery(this.cqh.mergeComponentQuery(), {name: component.name, version: component.version, purl: component['A_bom-ref']})
    }

    counter = 0;
    console.log("Writing dependencies")
    for await (const d1 of dependencies) {
      this.state = `Creating dependencies - ${++counter} of ${dependencies.length}`
      if (!('dependency' in d1)) continue;
      let next_dependency = d1.dependency;
      if (!(next_dependency instanceof Array)) {
        next_dependency = [next_dependency];
      }
      for await (const d2 of next_dependency) {
        await this.writeQuery(this.cqh.createDependencyQuery(), {project: p['A_bom-ref'], d1: d1['A_ref'], d2: d2['A_ref']})
      }
    }

    this.state = "Import complete!"
    console.log("Done");

  } catch (error) {
    console.error(error)
  }
  this.isLoading = false;
  }

  /** Retrieve existing project from the DB.*/
  loadProjects = async () => {
    const result = await this.readQuery(this.cqh.getProjectsQuery(), {})
    if (result !== null) this.projects = [await JSON.stringify(result.records, null, 2)]
  };

  getComponent = async () => {
    await this.writeQuery(this.cqh.getComponentWithNeighboursQuery(), {})
  }
}
