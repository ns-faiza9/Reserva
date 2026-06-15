import { fetchResources } from '../utils/api';

/**
 * Fetch resources from the local JWT FastAPI server running on port 8080.
 */
export async function fetchGithubResources() {
  try {
    const data = await fetchResources();

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
  } catch (error) {
    throw new Error(`Failed to load resources: ${error.message}`, { cause: error });
  }
}


