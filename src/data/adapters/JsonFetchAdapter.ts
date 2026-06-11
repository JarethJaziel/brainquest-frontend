export class JsonFetchAdapter {
  async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON from ${url}: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }
}
