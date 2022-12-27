/**
 * Function wrapper for better Fetch request support
 * @param url target URL where request will be sent
 * @param config Standard request config. Same as with Fetch API
 * @returns Boolean status + json response data if available
 */
export async function request(
  url: string,
  config: RequestInit = {}
): Promise<any> {
  const response = await fetch(url, config);
  if (!response.ok) {
    console.error(
      "Response from %s returned status code %d",
      url,
      response.status
    );
    return { json: undefined, status: response.ok };
  }
  return { json: await response.json(), status: response.ok };
}
