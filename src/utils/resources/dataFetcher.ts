import { ScrapedData } from '../../types/resources';
import { filterRemovedResources } from './filters';

/**
 * Fetches resource data from the API or static JSON file
 * @returns Promise with the fetched and processed data
 */
export const fetchResourceData = async (): Promise<ScrapedData[]> => {
  try {
    // Simple fetch that works in both development and production (including Vercel)
    const response = await fetch('/scraped-data.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    // Filter out removed resources
    return filterRemovedResources(jsonData);
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch travel information: ${errorMessage}`);
  }
}; 