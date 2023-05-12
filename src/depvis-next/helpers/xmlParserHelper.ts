import { XMLParser } from "fast-xml-parser";

// These tags will be always represented as an array
const alwaysArray = [
  "bom.dependencies.dependency",
  "bom.dependencies.dependency.dependency",
];

// Options for XMLParser
export const XMLParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  ignoreDeclaration: true,
  transformAttributeName: (attributeName: string) =>
    attributeName.replace(/-/g, ""),
  isArray: (_, jpath) => {
    console.log(jpath);

    if (alwaysArray.indexOf(jpath) !== -1) {
      return true;
    }
  },
};

// Function takes XML in plain text and transforms it into object
export async function parseXml(inputXml: string) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(inputXml);
  return xmlParsed;
}
