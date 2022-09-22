// interface Iis based on CycloneDX specification
// see https://cyclonedx.org/specification/overview/ for more details

export enum BomFormat {
  'CycloneDX',
}

export enum ComponentType {
  'application',
  'framework',
  'library',
  'container',
  'operating-system',
  'device',
  'firmware',
  'file',
}

export enum ComponentScope {
  'required',
  'optional',
  'excluded',
}
export interface ISbomProject {
  bomFormat: BomFormat;
  specVersion: string;
  version: number;
  metadata?: IMetadata;
  serialNumber?: string;
  components?: Array<IComponent>;
  services?: Array<IService>;
  dependencies?: Array<IDependency>;
  vulnerabilities?: Array<IVulnerability>;
  signature?: ISignature;
  properties?: Map<string, string>;
}

export interface IDependency {
  ref: string;
  properties?: Map<string, string>;
  dependsOn?: Array<IDependency>;
}

export interface IComponent {
  type: ComponentType;
  name: string;
  mime_type?: string;
  bom_ref?: string;
  supplier?: string;
  author?: string;
  publisher?: string;
  group?: string;
  version?: string;
  description?: string;
  scope?: ComponentScope;
  hashes?: Array<string>;
  licenses?: Array<string>;
  copyright?: string;
  cpe?: string;
  purl?: string;
  swid?: ISwid;
  modified?: boolean;
  pedigree?: any;
  externalReferences?: Array<any>;
  components?: Array<IComponent>;
  properties?: Map<string, string>;
  signature?: ISignature;
}

export interface ISwid {
  tagId: string;
  name: string;
  version?: string;
  url?: string;
}

export interface IService {
  name: string;
}

export interface IVulnerability {
  bom_ref?: string;
  id?: string;
  source?: string;
  references?: Array<IVulnerabilityReference>;
  ratings?: Array<string>;
}

export interface IVulnerabilityReference {
  id: string;
  source: string;
}
export interface ISignature {
  value: string;
  algorithm: string;
}

export interface IMetadata {
  timestamp?: Date;
  tools?: Array<string>;
  authors?: Array<string>;
  component?: IComponent;
  manufacture?: string;
  supplier?: string;
  licenses?: Array<string>;
}
