import { Project } from "./project";
import { Reference } from "./reference";
import { Vulnerability } from "./vulnerability";

export type Component = {
  /**
   * Unique id of component
   */
  id?: string;
  /**
   * Package URL (PURL) representation of component
   */
  purl: string;
  /**
   * Friendly component name
   */
  name: string;
  /**
   * Component type defined by Cyclone DX (see https://cyclonedx.org/use-cases/#inventory)
   */
  type: string;
  /**
   * Component version
   */
  version: string;
  /**
   * Author of the component
   */
  author?: string;
  /**
   * Component publisher
   */
  publisher?: string;
  /**
   * Number of dependencies represented as number. For better performance, this number is counted on Neo4j DB
   */
  dependsOnCount?: number;
  /**
   * List of all components that are direct dependencies for given component
   */
  dependsOn?: Component[];
  /**
   * References to external resources
   */
  references?: Reference[];
  /**
   * List of vulnerabilities for given component
   */
  vulnerabilities?: Vulnerability[];
  /**
   * Reference to a project that contains given component
   */
  project?: Project;
};

export type ComponentDto = Component & {
  projectVersion: any;
};

export type Dependency = {
  purl: string;
  dependsOn: {
    purl: string;
  }[];
};
