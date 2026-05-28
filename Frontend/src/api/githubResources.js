/**
 * GitHub blob URLs cannot be fetched directly — use raw.githubusercontent.com
 * @see https://raw.githubusercontent.com/ns-faiza9/Booking-api-data/main/resources.json
 */
export const GITHUB_RESOURCES_URL =
  'https://raw.githubusercontent.com/ns-faiza9/Booking-api-data/main/resources.json';

/**
 * @returns {Promise<import('../types/externalResource').ExternalResource[]>}
 */
export async function fetchGithubResources() {
  const response = await fetch(GITHUB_RESOURCES_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to load resources (${response.status})`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid JSON: expected an array of resources');
  }

  return data.filter(
    (item) =>
      item &&
      typeof item.id === 'number' &&
      typeof item.name === 'string' &&
      typeof item.type === 'string'
  );
}
