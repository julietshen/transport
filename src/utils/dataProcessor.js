/**
 * Data processing utility for the transgender travel information hub
 * This utility processes and categorizes scraped data
 */

/**
 * Categorize the data into predefined categories
 * @param {Array} data - The scraped data array
 * @returns {Object} - Categorized data object
 */
function categorizeData(data) {
  if (!data || !Array.isArray(data)) {
    return {
      documentation: [],
      safety: [],
      resources: [],
      general: []
    };
  }
  
  const categories = {
    documentation: [],
    safety: [],
    resources: [],
    general: []
  };
  
  // Define keywords for categorization
  const categoryKeywords = {
    documentation: ['passport', 'document', 'id', 'identification', 'gender marker', 'sex marker'],
    safety: ['safety', 'security', 'advisory', 'screening', 'travel advisory', 'restriction'],
    resources: ['resource', 'support', 'legal', 'assistance', 'help', 'checklist']
  };
  
  // Process each item and categorize it
  data.forEach(item => {
    const { title, content, source } = item;
    const lowerTitle = title?.toLowerCase() || '';
    const lowerContent = content?.toLowerCase() || '';
    const lowerSource = source?.toLowerCase() || '';
    
    // Check specific sources first
    if (
      lowerSource.includes('state department') || 
      lowerSource.includes('department of state')
    ) {
      categories.documentation.push(item);
      return;
    }
    
    if (
      lowerSource.includes('garden state') ||
      lowerSource.includes('equality')
    ) {
      categories.safety.push(item);
      return;
    }
    
    if (
      lowerSource.includes('lambda') ||
      lowerSource.includes('legal') ||
      lowerSource.includes('rights')
    ) {
      categories.resources.push(item);
      return;
    }
    
    // Check keywords in title and content
    let matched = false;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword) || lowerContent.includes(keyword))) {
        categories[category].push(item);
        matched = true;
        break;
      }
    }
    
    // If not matched to any category, put in general
    if (!matched) {
      categories.general.push(item);
    }
  });
  
  return categories;
}

/**
 * Sort data by recency
 * @param {Array} data - The data array to sort
 * @returns {Array} - Sorted data array
 */
function sortByRecency(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return [...data].sort((a, b) => {
    const dateA = new Date(a.lastUpdated);
    const dateB = new Date(b.lastUpdated);
    return dateB - dateA; // Sort in descending order (newest first)
  });
}

/**
 * Search within the data
 * @param {Array} data - The data array to search
 * @param {string} query - Search query
 * @returns {Array} - Filtered data matching the query
 */
function searchData(data, query) {
  if (!data || !Array.isArray(data) || !query) {
    return data || [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return data.filter(item => {
    const lowerTitle = item.title?.toLowerCase() || '';
    const lowerContent = item.content?.toLowerCase() || '';
    const lowerSource = item.source?.toLowerCase() || '';
    
    return (
      lowerTitle.includes(lowerQuery) ||
      lowerContent.includes(lowerQuery) ||
      lowerSource.includes(lowerQuery)
    );
  });
}

/**
 * Filter data by source
 * @param {Array} data - The data array to filter
 * @param {string} source - Source to filter by
 * @returns {Array} - Filtered data matching the source
 */
function filterBySource(data, source) {
  if (!data || !Array.isArray(data) || !source || source === 'all') {
    return data || [];
  }
  
  return data.filter(item => item.source === source);
}

/**
 * Extract all unique sources from the data
 * @param {Array} data - The data array
 * @returns {Array} - Array of unique source names
 */
function extractSources(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  const sourcesSet = new Set(data.map(item => item.source).filter(Boolean));
  return Array.from(sourcesSet);
}

/**
 * Process data for display
 * @param {Array} data - Raw data array
 * @param {Object} options - Processing options
 * @returns {Object} - Processed data
 */
function processData(data, options = {}) {
  const { 
    searchQuery = '', 
    sourceFilter = 'all',
    sortByDate = true
  } = options;
  
  if (!data || !Array.isArray(data)) {
    return {
      items: [],
      categories: {
        documentation: [],
        safety: [],
        resources: [],
        general: []
      },
      sources: []
    };
  }
  
  // Make a copy of the data to avoid mutation
  let processedData = [...data];
  
  // Apply source filtering if applicable
  if (sourceFilter !== 'all') {
    processedData = filterBySource(processedData, sourceFilter);
  }
  
  // Apply search filtering if applicable
  if (searchQuery) {
    processedData = searchData(processedData, searchQuery);
  }
  
  // Sort by date if requested
  if (sortByDate) {
    processedData = sortByRecency(processedData);
  }
  
  // Categorize the filtered & sorted data
  const categories = categorizeData(processedData);
  
  // Extract all unique sources
  const sources = extractSources(data); // Use original data for all sources
  
  return {
    items: processedData,
    categories,
    sources
  };
}

module.exports = {
  categorizeData,
  sortByRecency,
  searchData,
  filterBySource,
  extractSources,
  processData
}; 