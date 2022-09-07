import { observable, action, makeAutoObservable } from 'mobx';
import { useReadCypher } from 'use-neo4j';
import { ISbomProject } from '../interfaces/CycloneDX';

/**
 * This class provides functions for working with the input SBOM file.
 */
export class SbomStore {
  /**
   * Store projects and all their components.
   */
  projects: Array<ISbomProject>;

  /** Whether the store is loading. */
  isLoading: boolean;

  constructor() {
    this.projects = [];
    this.isLoading = false;
    makeAutoObservable(this);
  }

  /** Retrieve existing project from the DB.*/
  loadProjects = async () => {};

  // TODO: for experimenal use only
  executeReadQuery = (query: string) => {
    console.log(process.env);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Not Production');
    }
    console.log(query);
    return 'I see:' + query;
  };
}
