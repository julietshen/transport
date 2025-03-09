import { ScrapedData } from '../../types/resources';

/**
 * Filters out outdated or inappropriate resources from the data set
 * @param items Array of scraped data items
 * @returns Filtered array with removed resources excluded
 */
export const filterRemovedResources = (items: ScrapedData[]): ScrapedData[] => {
  return items.filter(item => {
    // Remove CDC resources as they no longer exist
    if (item.title === "CDC - Transgender Health" || 
        item.name === "CDC - Transgender Health" || 
        (item.source === "CDC" && item.title.toLowerCase().includes("transgender"))) {
      return false;
    }
    
    // Remove Lex as it's a social app, not an informational resource
    if (item.title === "Lex - Text-Centered Community Platform" || 
        item.name === "Lex" || 
        item.source === "Lex") {
      return false;
    }
    
    // Remove generic resources that aren't focused on transgender travelers
    if (item.url === "https://www.usa.gov/passport" ||
        (item.url && item.url.toLowerCase().includes("usa.gov")) ||
        item.name === "USA.gov Passport Information") {
      return false;
    }
    
    // Remove outdated TSA pages
    if (item.url === "https://www.tsa.gov/travel/tsa-cares/gender-diversity" ||
        (item.url && item.url.toLowerCase().includes("tsa-cares/gender-diversity"))) {
      return false;
    }
    
    return true;
  });
};

/**
 * Determines a resource's type based on its properties
 * @param item A scraped data item
 * @returns 'scraped' or 'permanent' depending on the resource type
 */
export const getResourceType = (item: ScrapedData): 'scraped' | 'permanent' => {
  // Logic to determine if a resource is scraped or permanent
  const isPermanent = 
    item.source === 'Permanent Resource' || 
    item.name?.includes('Checklist') || 
    item.title?.includes('Checklist') ||
    item.source === 'State Department' ||
    item.source === 'TSA' ||
    // Include news sources like Erin in the Morning
    item.source?.includes('Erin') ||
    item.source?.includes('News') ||
    // Include all sources that were previously filtered out
    (item.source && ['ACLU', 'Lambda Legal', 'NCTE', 'Refuge Restrooms', 'GeoSure', 'TravelSafer'].includes(item.source));
    
  return isPermanent ? 'permanent' : 'scraped';
};

/**
 * Calculates a priority score for a resource based on its properties
 * Higher priority resources appear at the top of listings
 * @param item A scraped data item
 * @returns A numerical priority score (higher = more important)
 */
export const getResourcePriority = (item: ScrapedData): number => {
  let priority = 0;
  
  // Explicit priority based on source
  if (item.source === 'State Department') priority += 50;
  if (item.source === 'TSA') priority += 45;
  if (item.source === 'Lambda Legal') priority += 40;
  if (item.source === 'ACLU') priority += 35;
  if (item.source === 'NCTE') priority += 30;
  if (item.source === 'Erin in the Morning') priority += 60; // Higher priority for news
  if (item.source === 'The Advocate') priority += 60; // Higher priority for news
  if (item.source === 'Trans World Express') priority += 55; // Emergency resources high priority
  
  // Boost for specific content we want to highlight
  const content = item.content?.toLowerCase() || '';
  const title = item.title?.toLowerCase() || '';
  
  // Critical alerts about X gender markers and passport restrictions
  if (content.includes('x gender marker') || title.includes('gender marker')) priority += 40;
  if (content.includes('marco rubio') || title.includes('rubio')) priority += 40;
  if (content.includes('germany') && content.includes('warning')) priority += 40;
  
  // Boost for items with title containing priority keywords
  if (title.includes('passport')) priority += 25;
  if (title.includes('advisory')) priority += 20;
  if (title.includes('alert')) priority += 20;
  if (title.includes('warning')) priority += 20;
  if (title.includes('urgent')) priority += 30; // Higher priority for urgent items
  if (title.includes('banned') || title.includes('ban')) priority += 25;
  if (title.includes('id') || title.includes('identification')) priority += 15;
  if (title.includes('screening')) priority += 15;
  if (title.includes('security')) priority += 15;
  if (title.includes('safety')) priority += 10;
  
  return priority;
};

/**
 * Comparison function for sorting resources by priority and date
 * @param a First scraped data item to compare
 * @param b Second scraped data item to compare
 * @returns Sort order number (-1, 0, 1)
 */
export const sortByPriorityAndDate = (a: ScrapedData, b: ScrapedData): number => {
  // Get resource type first (permanent resources come before scraped ones)
  const aType = getResourceType(a);
  const bType = getResourceType(b);
  
  // If types are different, permanent comes first
  if (aType !== bType) {
    return aType === 'permanent' ? -1 : 1;
  }
  
  // If both are same type, check priority
  const aPriority = getResourcePriority(a);
  const bPriority = getResourcePriority(b);
  
  if (aPriority !== bPriority) {
    return bPriority - aPriority; // Higher priority first
  }
  
  // If priority is the same, sort by date
  try {
    const aDate = new Date(a.lastUpdated).getTime();
    const bDate = new Date(b.lastUpdated).getTime();
    return bDate - aDate; // More recent first
  } catch (e) {
    return 0;
  }
}; 