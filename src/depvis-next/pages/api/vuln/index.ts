export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}

export function request(url: string, config: RequestInit = {}): Promise<any> {
  return fetch(url, config).then((data) => data.json());
}
