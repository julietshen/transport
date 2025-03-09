/**
 * Type definitions related to travel resources and scraped data
 */

// Define valid category types for better type safety
export type ResourceCategory = 
  | 'currentAlerts'
  | 'travelPlanning'
  | 'identityDocuments'
  | 'communityResources'
  | 'allResources';

/**
 * Represents a single data entry scraped from various trans travel information sources
 */
export interface ScrapedData {
  source: string;
  title: string;
  content: string;
  lastUpdated: string;
  url: string;
  tags?: string[];
  name?: string;
  category?: string;
  // New explicit categorization fields
  primaryCategory?: ResourceCategory;
  secondaryCategories?: ResourceCategory[];
  isExcluded?: boolean;
}

/**
 * Static alert interface for predefined alerts
 */
export interface StaticAlert {
  status: 'info' | 'warning' | 'error' | 'success';
  text: string;
} 