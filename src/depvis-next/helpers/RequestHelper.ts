export async function request(
  url: string,
  config: RequestInit = {}
): Promise<any> {
  const response = await fetch(url, config);
  if (!response.ok) {
    console.error(
      "Response from %s returned status code %d\n%s",
      url,
      response.status,
      response.text
    );
  }
  return { json: await response.json(), status: response.ok };
}
