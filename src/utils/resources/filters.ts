import { ScrapedData, ResourceCategory } from '../../types/resources';

/**
 * Filter out resources that shouldn't be displayed at all
 */
export const filterRemovedResources = (items: ScrapedData[]): ScrapedData[] => {
  return items.filter(item => {
    const title = item.title?.toLowerCase() || '';
    const source = item.source?.toLowerCase() || '';
    const content = item.content?.toLowerCase() || '';

    // Specifically exclude the State Department international travel resource
    if (source.includes('u.s. department of state') && 
        (title.includes('international travel') || 
         title.includes('travel guidance') ||
         (content.includes('country-specific') && content.includes('lgbtqi+')))) {
      return false;
    }

    // Skip TSA precheck content only (but keep other TSA content)
    if (title.includes('precheck') || content.includes('tsa precheck')) {
      return false;
    }

    // Skip ACLU workplace discrimination content
    if (source.includes('aclu') && 
        (title.includes('workplace') || title.includes('employment'))) {
      return false;
    }

    // Skip STEP program information as it's not advisable
    if (title.includes('step program') || content.includes('smart traveler enrollment')) {
      return false;
    }

    // Skip general State Department notices not specific to trans travelers
    // But keep other State Department content
    if (source.includes('state department') && 
        title.includes('notice') && 
        !title.includes('transgender') && 
        !title.includes('gender') &&
        !title.includes('passport')) {
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

/**
 * Categorize resources based on content analysis
 * This is used to assign primaryCategory and secondaryCategories to resources
 * that don't have them explicitly set
 */
export const categorizeResource = (resource: ScrapedData): ScrapedData => {
  // Don't modify if already categorized
  if (resource.primaryCategory) {
    return resource;
  }

  const result = { ...resource };
  const title = result.title?.toLowerCase() || '';
  const source = result.source?.toLowerCase() || '';
  const content = result.content?.toLowerCase() || '';
  const tags = result.tags?.map(tag => tag.toLowerCase()) || [];

  // Create a secondary categories array if needed
  if (!result.secondaryCategories) {
    result.secondaryCategories = [];
  }

  // Current Alerts
  if (
    (title.includes('warning') && new Date(result.lastUpdated) > new Date('2025-02-15')) ||
    title.includes('advisory') ||
    title.includes('alert') ||
    source.includes('garden state') ||
    (title.includes('germany') && title.includes('transgender')) ||
    (title.includes('rubio') && title.includes('transgender')) ||
    (source.includes('advocate') && title.includes('germany')) ||
    (source.includes('erin') && title.includes('visa'))
  ) {
    result.primaryCategory = 'currentAlerts';
  } 
  // Identity Documents
  else if (
    tags.some(tag => 
      tag.includes('documentation') || 
      tag.includes('passport') || 
      tag.includes('id') || 
      tag.includes('identity')
    ) ||
    title.includes('passport') ||
    title.includes('id ') || // space after 'id' to avoid matching words containing 'id'
    title.includes('identity') ||
    title.includes('document') ||
    content.includes('passport policy') ||
    content.includes('gender marker')
  ) {
    result.primaryCategory = 'identityDocuments';
  }
  // Travel Planning
  else if (
    (title.includes('visa') || 
     content.includes('visa policy') ||
     content.includes('visa requirement')) ||
    (source.includes('erin') && 
     (title.includes('travel') || 
      title.includes('border'))) ||
    tags.some(tag => 
      tag.includes('travel') || 
      tag.includes('planning')
    ) ||
    title.includes('travel')
  ) {
    result.primaryCategory = 'travelPlanning';
  }
  // Community Resources
  else if (
    tags.some(tag => 
      tag.includes('community') || 
      tag.includes('resource') ||
      tag.includes('support')
    ) ||
    source.includes('lambda legal') ||
    source.includes('transgender law')
  ) {
    result.primaryCategory = 'communityResources';
  }
  // Default to all resources if no specific category
  else {
    result.primaryCategory = 'allResources';
  }

  // Add to all resources as a secondary category
  if (result.primaryCategory !== 'allResources') {
    result.secondaryCategories.push('allResources');
  }

  return result;
};

/**
 * Check if a resource belongs in a specific category
 */
export const isResourceInCategory = (resource: ScrapedData, category: ResourceCategory): boolean => {
  // First categorize the resource if it's not already categorized
  const categorizedResource = resource.primaryCategory 
    ? resource 
    : categorizeResource(resource);
  
  // Check if this is the primary category
  if (categorizedResource.primaryCategory === category) {
    return true;
  }
  
  // Check if this is a secondary category
  if (categorizedResource.secondaryCategories?.includes(category)) {
    return true;
  }
  
  // All resources always show in the all resources tab
  if (category === 'allResources') {
    return true;
  }
  
  return false;
}; 