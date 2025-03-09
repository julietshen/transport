/**
 * ResourceService.ts
 * Service for resource-related data operations
 */

import { ScrapedData, ResourceCategory } from '../types/resources';

/**
 * Interface for ResourceService methods
 */
export interface IResourceService {
  fetchResources(): Promise<ScrapedData[]>;
  filterByCategory(resources: ScrapedData[], category: string): ScrapedData[];
  filterBySearch(resources: ScrapedData[], searchTerm: string): ScrapedData[];
  sortByDate(resources: ScrapedData[]): ScrapedData[];
}

/**
 * Service implementation for resource data operations
 */
export class ResourceService implements IResourceService {
  private dataUrl: string;
  
  /**
   * Creates a new ResourceService instance
   * @param dataUrl URL to fetch resource data from (defaults to /scraped-data.json)
   */
  constructor(dataUrl: string = '/scraped-data.json') {
    this.dataUrl = dataUrl;
  }
  
  /**
   * Fetches resource data from the specified URL
   * @returns Promise resolving to the resource data
   */
  async fetchResources(): Promise<ScrapedData[]> {
    try {
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.sortByDate(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }
  
  /**
   * Filters resources by category
   * @param resources Resources to filter
   * @param category Category to filter by
   * @returns Filtered resources
   */
  filterByCategory(resources: ScrapedData[], category: string): ScrapedData[] {
    // Return all resources if category is 'allResources'
    if (category === 'allResources') {
      return resources;
    }
    
    // Convert category string to ResourceCategory type
    const resourceCategory = category as ResourceCategory;
    
    return resources.filter(resource => {
      // Check primary category
      if (resource.primaryCategory === resourceCategory) {
        return true;
      }
      
      // Check secondary categories
      if (resource.secondaryCategories?.includes(resourceCategory)) {
        return true;
      }
      
      // Handle legacy data format (using tags or categories)
      if (!resource.primaryCategory) {
        // Check category field
        if (resource.category === category) {
          return true;
        }
        
        // Check tags
        if (resource.tags) {
          const lowerTags = resource.tags.map(tag => tag.toLowerCase());
          
          // Map category to relevant tags
          const categoryTags: Record<string, string[]> = {
            'currentAlerts': ['alert', 'warning', 'critical', 'urgent'],
            'travelPlanning': ['planning', 'preparation', 'guide'],
            'identityDocuments': ['passport', 'id', 'documentation', 'documents'],
            'communityResources': ['community', 'support', 'resource', 'legal']
          };
          
          return lowerTags.some(tag => categoryTags[category]?.includes(tag));
        }
      }
      
      return false;
    });
  }
  
  /**
   * Filters resources by search term
   * @param resources Resources to filter
   * @param searchTerm Term to search for
   * @returns Filtered resources
   */
  filterBySearch(resources: ScrapedData[], searchTerm: string): ScrapedData[] {
    if (!searchTerm.trim()) {
      return resources;
    }
    
    const term = searchTerm.toLowerCase();
    
    return resources.filter(resource => {
      const title = resource.title?.toLowerCase() || '';
      const content = resource.content?.toLowerCase() || '';
      const source = resource.source?.toLowerCase() || '';
      const tags = resource.tags?.join(' ').toLowerCase() || '';
      
      return (
        title.includes(term) || 
        content.includes(term) || 
        source.includes(term) || 
        tags.includes(term)
      );
    });
  }
  
  /**
   * Sorts resources by date (newest first)
   * @param resources Resources to sort
   * @returns Sorted resources
   */
  sortByDate(resources: ScrapedData[]): ScrapedData[] {
    return [...resources].sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return dateB - dateA;
    });
  }
} 