import { processBatchAsync } from "../../../helpers/BatchHelper";
import { GetComponents } from "../../../helpers/DbDataHelper";
import { CreateUpdateVulnerability } from "../../../helpers/DbDataProvider";
import { VulnFetcherHandler } from "../../../vulnerability-mgmt/VulnFetcherHandler";
export default async function handler(req, res) {
  const { components } = await GetComponents();
  const purlList = components.map((c) => c.purl);
  const r = await processBatchAsync<any[]>(purlList, VulnFetcherHandler, {
    chunkSize: 100,
  });

  //Use queue here
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
  res.status(200).json(r);
}
