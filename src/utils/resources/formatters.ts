import { ScrapedData } from '../../types/resources';
import { getResourceType } from './filters';

/**
 * Formats a date string into a more readable format
 * @param dateString Date string to format
 * @returns Formatted date string without any prefix
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format like "Mar 15, 2025"
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Gets the badge properties for a resource based on its priority
 * @param item A scraped data item
 * @returns Object with badge color scheme and label
 */
export const getPriorityBadgeProps = (item: ScrapedData) => {
  const title = item.title?.toLowerCase() || '';
  const tags = item.tags || [];
  
  // Check for warning or advisory content
  if (title.includes('warning') || title.includes('advisory') || tags.includes('warning')) {
    return { colorScheme: 'red', label: 'Advisory' };
  }
  
  // Check for passport or identification documents
  if (title.includes('passport') || title.includes('id') || title.includes('identification') || 
      title.includes('document') || tags.includes('documentation')) {
    return { colorScheme: 'orange', label: 'Documentation' };
  }
  
  // Check for legal resources
  if (title.includes('legal') || tags.includes('legal')) {
    return { colorScheme: 'purple', label: 'Legal' };
  }

  // Check for safety resources
  if (title.includes('safety') || tags.includes('safety')) {
    return { colorScheme: 'yellow', label: 'Safety' };
  }
  
  // Default badge
  return { colorScheme: 'blue', label: 'Resource' };
};

/**
 * Gets a descriptive string for the resource type
 * @param item A scraped data item
 * @returns Always returns an empty string to hide any resource type labels
 */
export const getResourceTypeWithYear = (item: ScrapedData): string => {
  // Return empty string for all resources
  return '';
}; 