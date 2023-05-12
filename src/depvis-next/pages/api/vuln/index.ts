import { processBatchAsync } from "../../../helpers/BatchHelper";
import { GetComponents } from "../../../helpers/DbDataHelper";
import { CreateUpdateVulnerability } from "../../../helpers/DbDataProvider";
import { VulnFetcherHandler } from "../../../vulnerability-mgmt/VulnFetcherHandler";

/**
 * Handler will fetch vulnerabilities for all components
 */
export default async function handler(_, res) {
  const { components } = await GetComponents();
  const purlList = components.map((c) => c.purl);
  const r = await processBatchAsync<any[]>(purlList, VulnFetcherHandler, {
    chunkSize: 100,
  });

  r.forEach(async (component) => {
    if (component.vulnerabilities.length > 0) {
      console.log(
        "Creating %d vulns for %s",
        component.vulnerabilities.length,
        component.purl
      );
      await CreateUpdateVulnerability(
        component.purl,
        component.vulnerabilities
      );
    }
  });
  return res.status(200).json(r);
}
