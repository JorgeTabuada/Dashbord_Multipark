/**
 * Generic external API caller.
 * Currently a stub — replace with actual API integrations as needed.
 */

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export async function callDataApi(
  apiId: string,
  _options: DataApiCallOptions = {}
): Promise<unknown> {
  // TODO: Implement specific API integrations as needed
  throw new Error(`Data API "${apiId}" is not implemented. Add specific integrations as needed.`);
}
