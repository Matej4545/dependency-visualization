import { processBatchAsync } from '../../../helpers/BatchHelper';
import { CreateUpdateVulnerability, GetComponents } from '../../../helpers/DbDataHelper';
import { VulnFetcherHandler } from '../../../vulnerability-mgmt/VulnFetcherHandler';
export default async function handler(req, res) {
  const { components } = await GetComponents();
  const purlList = components.map((c) => c.purl);
  const r = await processBatchAsync(purlList, VulnFetcherHandler, 100);

  //Use queue here
  r.forEach(async (component) => {
    if (component.vulnerabilities.length > 0) {
      console.log('Creating %d vulns for %s', component.vulnerabilities.length, component.purl);
      await CreateUpdateVulnerability(component.purl, component.vulnerabilities);
    }
  });
  res.status(200).json(r);
}
