import { parseXml } from "./xmlParserHelper";
// Allowed file extension
export const allowedExtensionsRegex = /(\.xml)$/i;

/**
 * Represent the statistics object for imported project
 */
export interface projectStats {
  componentsCount: number;
  dependenciesCount: number;
  error: boolean;
}

/**
 * Function will try to parse provided file and return statistics about the SBOM
 * @param fileXml selected file
 * @returns projectStats object
 */
export const tryParseFile = async (fileXml): Promise<projectStats> => {
  try {
    const parsedXml = await parseXml(fileXml);
    const dependencies =
      parsedXml.bom.dependencies &&
      parsedXml.bom.dependencies.dependency
        .map((d) => (d.dependency ? d.dependency.length : 0))
        .reduce((sum, current) => sum + current, 0);
    console.log(dependencies);
    return {
      componentsCount: parsedXml.bom.components.component.length,
      dependenciesCount: dependencies,
      error: false,
    };
  } catch {
    return { componentsCount: 0, dependenciesCount: 0, error: true };
  }
};
