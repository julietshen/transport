const cheerio = require('cheerio');
const axios = require('axios');

// Configure axios with browser-like headers
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
});

/**
 * Fallback content for Garden State Equality travel advisory
 * Updated with 2025 information as requested
 */
const fallbackContent = {
  source: "Garden State Equality",
  title: "Travel Advisory for Nonbinary and Trans New Jersey Residents",
  content: `As of 2025, Garden State Equality continues to advise transgender and nonbinary residents of New Jersey to exercise caution when traveling to states with restrictive laws. The advisory recommends carrying all necessary documentation, researching local laws before travel, and having contact information for legal resources. States with anti-transgender legislation may present risks for New Jersey residents accustomed to stronger protections at home. Garden State Equality provides a pre-travel checklist and emergency resources for transgender travelers.`,
  lastUpdated: "2025-02-28T00:00:00.000Z",
  url: "https://www.gardenstateequality.org/release-travel-advisory-for-nonbinary-and-trans-new-jersey-residents/"
};

/**
 * Scrape the Garden State Equality website for trans travel advisory information
 */
async function scrapeGardenState() {
  const url = 'https://www.gardenstateequality.org/release-travel-advisory-for-nonbinary-and-trans-new-jersey-residents/';
  
  try {
    console.log('Attempting to scrape Garden State Equality website...');
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    
    // Try different selectors to find the main content
    const contentSelectors = [
      '.entry-content', 
      'article', 
      '.post-content',
      '.page-content',
      'main'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const selectedContent = $(selector).text().trim();
      if (selectedContent && selectedContent.length > 100) {
        content = selectedContent;
        break;
      }
    }
    
    if (!content) {
      console.log('No suitable content found on Garden State Equality page');
      return fallbackContent;
    }
    
    // Extract the title - try a few different selectors
    let title = '';
    const titleSelectors = ['h1.entry-title', 'h1', '.page-title', 'article h1'];
    for (const selector of titleSelectors) {
      const selectedTitle = $(selector).first().text().trim();
      if (selectedTitle) {
        title = selectedTitle;
        break;
      }
    }
    
    // If no title found, use default
    if (!title) {
      title = "Travel Advisory for Nonbinary and Trans New Jersey Residents";
    }
    
    return {
      source: "Garden State Equality",
      title: title,
      content: content.substring(0, 1500), // Limit content length
      lastUpdated: new Date().toISOString(),
      url: url
    };
  } catch (error) {
    console.error('Error scraping Garden State Equality website:', error);
    console.log('Using fallback content for Garden State Equality');
    return fallbackContent;
  }
}

module.exports = { scrapeGardenState }; 