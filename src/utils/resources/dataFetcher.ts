import { ScrapedData } from '../../types/resources';
import { filterRemovedResources } from './filters';

/**
 * Fetches resource data from the API or static JSON file
 * @returns Promise with the fetched and processed data
 */
export const fetchResourceData = async (): Promise<ScrapedData[]> => {
  // Set basePath based on environment
  const basePath = process.env.NODE_ENV === 'production' ? '/transport' : '';
  
  try {
    // Try to fetch from the root path first
    try {
      const response = await fetch(`${basePath}/scraped-data.json`);
      if (response.ok) {
        const jsonData = await response.json();
        // Filter out removed resources first
        return filterRemovedResources(jsonData);
      }
    } catch (error) {
      console.error('Error fetching from root path:', error);
    }
    
    // If that fails, try the public directory
    const response = await fetch(`${basePath}/public/scraped-data.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const jsonData = await response.json();
    // Filter out removed resources
    return filterRemovedResources(jsonData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch travel information: ${errorMessage}`);
  }
}; 