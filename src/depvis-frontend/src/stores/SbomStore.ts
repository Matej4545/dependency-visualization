import { action, makeObservable, observable } from 'mobx';
import { Neo4jHelper } from '../helpers/Neo4jHelper';
import { CycloneDXHelper } from '../helpers/CycloneDXHelper';
import { CypherQueryHelper } from './CypherQueryHelper';
import { BomFormat, ComponentType, IComponent, IDependency, ISbomProject } from '../interfaces/CycloneDX';

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
  project: IResultNode[]; //Array<ISbomProject>;
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
    this.project = [];
    this.isLoading = false;
    this.state = '';
    this.isConnected = false;
    this.cqh = new CypherQueryHelper();
    this.n4jHelper = new Neo4jHelper();
    makeObservable(this, {
      isConnected: observable,
      isLoading: observable,
      state: observable,
      project: observable,
      json: observable,
      parseProject: action,
    });
  }

  parseProject = async (input: File) => {
    const cdx = new CycloneDXHelper();
    const parsed = await cdx.parse(input);

    this.storeProject(parsed);
  };

  /**id={r._fields[0].elementId}
                  name={r._fields[0].properties.name}
                  properties={r._fields[0].properties}
                  type={r._fields[0].labels[0]}
   */

  isInResult = (node: any) => {
    return this.project.find((n) => {
      n.name === node.name;
    });
  };

  parseResult = (input: any) => {
    this.project = [];
    console.log(input);
    input.records.map((res: any) => {
      const nodeInfo = res._fields[0];
      this.parseResultNode(nodeInfo);
    });
  };

  parseResultNode = (resultNode: any) => {
    const newNode = {
      name: resultNode.properties.name,
      id: resultNode.elementId,
      properties: resultNode.properties,
      label: resultNode.labels[0],
    };
    if (!this.isInResult(newNode)) {
      this.project.push(newNode);
    }
  };

  runQuery = async (query: string) => {
    const res = await this.n4jHelper.writeQuery(query, {});
    this.parseResult(res);
    this.json = await JSON.stringify(this.project, null, 2);
  };

  storeProject = async (input: any) => {
    this.isLoading = true;

    //Create main project
    let project: ISbomProject;
    project = {
      bomFormat: BomFormat.CycloneDX,
      specVersion: '1.3',
      version: input.bom.version,
    };

    const bom = input.bom;
    const mainComponentPath = input.bom.metadata ? input.bom.metadata.component : undefined;
    const mainComponentType = mainComponentPath.type;
    let mainComponent: IComponent = {
      type: (mainComponentType as ComponentType) || ComponentType.application,
      name: mainComponentPath.name,
      purl: mainComponentPath.purl || '',
      version: mainComponentPath.version || 'undefined',
      bom_ref: mainComponentPath['bom-ref'],
    };

    let components = this.parseComponents(bom.components ? bom.components.component : []);

    let dependencies = this.parseDependencies(bom.dependencies ? bom.dependencies.dependency : []);

    console.log({ components: components, deps: dependencies, mainComponent: mainComponent });

    try {
      this.state = `Creating project ${mainComponent.name}`;
      await this.n4jHelper.writeQuery(this.cqh.mergeProjectQuery, {
        name: mainComponent.name,
        version: mainComponent.version,
        purl: mainComponent.purl,
        type: mainComponent.type,
      });

      this.state = `Creating components - 0 of ${components.length}`;
      let counter = 0;
      for await (const component of components) {
        this.state = `Creating components - ${++counter} of ${components.length}`;
        await this.n4jHelper.writeQuery(this.cqh.mergeComponentQuery, {
          name: component.name,
          version: component.version,
          purl: component.purl,
          type: component.type,
        });
      }

      counter = 0;
      this.state = `Creating dependencies - ${++counter} of ${dependencies.length}`;
      for await (const d1 of dependencies) {
        this.state = `Creating dependencies - ${++counter} of ${dependencies.length}`;
        if (!d1.dependsOn || d1.dependsOn.length == 0) continue;
        for await (const d2 of d1.dependsOn) {
          await this.n4jHelper.writeQuery(this.cqh.createDependencyQuery, {
            project: mainComponent.bom_ref,
            d1: d1.ref,
            d2: d2.ref,
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

  parseComponents = (components: any) => {
    let result: IComponent[] = [];
    components.map((component: any) => {
      result.push({
        type: (component.type as ComponentType) || ComponentType.application,
        name: component.name,
        purl: component.purl || '',
        version: component.version || 'undefined',
      } as IComponent);
    });
    return result;
  };

  parseDependencies = (dependencies: any) => {
    let result: IDependency[] = [];
    dependencies.map((dependency: any) => {
      const index = result.findIndex((d) => {
        d.ref === dependency.ref;
      });
      if (index == -1) {
        result.push({
          ref: dependency.ref,
          dependsOn: this.getDependsOn(dependency),
        } as IDependency);
      } else {
        result[index].dependsOn = this.getDependsOn(dependency);
      }
    });
    return result;
  };

  getDependsOn = (dependency: any) => {
    let result: IDependency[] = [];
    if (dependency.dependency == undefined) return result;
    let dependsOnArray: any = dependency.dependency;
    if (!(dependsOnArray instanceof Array)) dependsOnArray = [dependsOnArray];
    dependsOnArray.map((dependency: any) => {
      result.push({ ref: dependency.ref } as IDependency);
    });
    return result;
  };
  removeAll = () => {
    this.runQuery('MATCH (n) DETACH DELETE n');
  };
}
