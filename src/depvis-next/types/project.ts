import { Component } from './component';

export type Project = {
  /**
   * Unique ID of project
   */
  id?: string;
  /**
   * Friendly name
   */
  name: string;
  /**
   * List of versions related to a given project
   */
  versions?: ProjectVersion[];
};

type ProjectVersionBase = {
  /**
   * Project Version Id
   */
  id?: string;
  /**
   * Project version
   */
  version?: string;
  /**
   * List of all components in a given project
   */
  components?: Component[];
  /**
   * Date when SBOM was created for a given project
   */
  date?: Date;
};

export type ProjectVersion = ProjectVersionBase & {
  /**
   * Represents to which project a given version belongs
   */
  project: Project;
};

export type ProjectVersionDto = ProjectVersionBase & {
  /**
   * Represents graphql connection
   */
  project: any;
};
