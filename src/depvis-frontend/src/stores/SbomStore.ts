import { action, makeObservable, observable } from 'mobx';
import { Neo4jHelper } from '../helpers/Neo4jHelper';
import { CycloneDXHelper } from '../helpers/CycloneDXHelper';
import { CypherQueryHelper } from './CypherQueryHelper';

interface IResultNode {
  name: string;
  id: number;
  properties?: any;
  label?: string;
  dependencies?: [any];
}
/**
 * This class provides functions for working with the input SBOM file.
 */
export class SbomStore {
  /**
   * Store projects and all their components.
   */
  projects: IResultNode[]; //Array<ISbomProject>;
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
   * CypherQueryHelper
   */
  cqh: CypherQueryHelper;

  n4jHelper: Neo4jHelper;

  json: string = '';

  constructor() {
    this.projects = [];
    this.isLoading = false;
    this.state = '';
    this.isConnected = false;
    this.cqh = new CypherQueryHelper();
    this.n4jHelper = new Neo4jHelper();
    makeObservable(this, {
      isConnected: observable,
      isLoading: observable,
      state: observable,
      projects: observable,
      json: observable,
      parseProject: action,
    });
    this.checkConnection();
  }

  checkConnection = async () => {
    // try {
    //   const res = await this.neo4jDriver.getServerInfo();
    // } catch {
    //   console.error('Could not make connection to the server!');
    //   this.isConnected = false;
    // }
    this.isConnected = true;
  };

  parseProject = async (input: File) => {
    const cdx = new CycloneDXHelper();
    const parsed = await cdx.parse(input);

    this.storeProject(parsed);
    // const parser = new XMLParser(options);
    // try {
    //   this.state = "Parsing XML file"
    //   const obj = parser.parse(input);
    //   this.storeProject(obj)
    // } catch (error) {
    //   this.state = "Error - check console"
    //   console.log(error)
    // }
  };

  /**id={r._fields[0].elementId}
                  name={r._fields[0].properties.name}
                  properties={r._fields[0].properties}
                  type={r._fields[0].labels[0]}
   */

  isInResult = (node: any) => {
    return this.projects.find((n) => {
      n.name === node.name;
    });
  };

  parseResult = (input: any) => {
    this.projects = [];
    console.log(input);
    input.records.map((res: any) => {
      const nodeInfo = res._fields[0];
      const newNode = {
        name: nodeInfo.properties.name,
        id: nodeInfo.elementId,
        properties: nodeInfo.properties,
        label: nodeInfo.labels[0],
      };
      if (!this.isInResult(newNode)) {
        this.projects.push(newNode);
      }
    });
  };

  runQuery = async (query: string) => {
    const res = await this.n4jHelper.writeQuery(query, {});
    this.parseResult(res);
    this.json = await JSON.stringify(this.projects, null, 2);
  };

  storeProject = async (input: any) => {
    this.isLoading = true;
    let components = input.bom.components ? input.bom.components.component : [];
    let dependencies = input.bom.dependencies ? input.bom.dependencies.dependency : [];
    const p = input.bom.metadata ? input.bom.metadata.component : undefined;
    console.log({ components: components, deps: dependencies, p: p });

    try {
      this.state = `Creating project ${p.name}`;
      console.log('Writing project');
      p &&
        (await this.n4jHelper.writeQuery(this.cqh.mergeProjectQuery, {
          name: p.name,
          version: p.version,
          purl: p['bom-ref'],
        }));

      console.log('Writing components');

      if (!(components instanceof Array)) {
        components = [components];
      }
      this.state = `Creating components - 0 of ${components.length}`;
      let counter = 0;
      for await (const component of components) {
        this.state = `Creating components - ${++counter} of ${components.length}`;
        await this.n4jHelper.writeQuery(this.cqh.mergeComponentQuery, {
          name: component.name,
          version: component.version,
          purl: component['bom-ref'],
        });
      }

      counter = 0;
      console.log('Writing dependencies');
      for await (const d1 of dependencies) {
        this.state = `Creating dependencies - ${++counter} of ${dependencies.length}`;
        if (!('dependency' in d1)) continue;
        let next_dependency = d1.dependency;
        if (!(next_dependency instanceof Array)) {
          next_dependency = [next_dependency];
        }
        for await (const d2 of next_dependency) {
          await this.n4jHelper.writeQuery(this.cqh.createDependencyQuery, {
            project: p['bom-ref'],
            d1: d1['ref'],
            d2: d2['ref'],
          });
        }
      }

      this.state = 'Import complete!';
      console.log('Done');
    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;
  };
}
