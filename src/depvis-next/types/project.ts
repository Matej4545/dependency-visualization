import { Component } from "./component";

export type Project = {
  /**
   * Unique ID of project
   */
  id: string;
  /**
   * Friendly name
   */
  name: string;
  /**
   * Project version
   */
  version?: string;
  /**
   * List of all components in a given project
   */
  components?: [Component];
  /**
   * Date when SBOM was created for a given project
   */
  date?: Date;
};
