export type GraphConfig = {
  zoomLevel: number;
  color: string | Function;
  label: string | Function;
  linkDirectionalArrowLength: number;
  linkDirectionalRelPos: number;
  nodeVal: number | Function;
  linkLength: number;
  showOnlyVulnerable: boolean;
  connectNodesToRoot: boolean;
  graphForce: number;
};
