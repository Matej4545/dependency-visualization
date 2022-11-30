import { VulnFetcherHandler } from '../../../vulnerability-mgmt/VulnFetcherHandler';

export default async function handler(req, res) {
  const { purl } = req.query;
  const purl_j = purl.join('/');
  console.log(purl_j);
  try {
    const result = await VulnFetcherHandler(purl_j);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
