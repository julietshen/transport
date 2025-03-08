const fs = require('fs');
const path = require('path');
const { scrapeStateDept } = require('../scrapers/stateDeptScraper');
const { scrapeGardenState } = require('../scrapers/gardenStateScraper');
const { scrapeLambdaLegal } = require('../scrapers/lambdaLegalScraper');
const { scrapeAdditionalSources, generateStaticResources } = require('../scrapers/additionalSourcesScraper');
const axios = require('axios');
const cheerio = require('cheerio');

// Configure axios with browser-like headers and longer timeout
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

// Ensure the public directory exists
function ensurePublicDirectory() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
}

// Fallback content in case scraping fails
const fallbackContent = [
  {
    source: "Transportation Safety",
    title: "Travel Safety Tips for Trans Passengers",
    content: "The National Center for Transgender Equality provides comprehensive guidance for transgender travelers, including tips for airport security, documentation requirements, and passenger rights. Key recommendations include carrying copies of relevant medical documentation, knowing your rights during screening procedures, and contacting TSA Cares for assistance.",
    lastUpdated: new Date().toISOString(),
    url: "https://transequality.org/know-your-rights/airport-security",
    tags: ["security", "screening", "airport", "documentation"]
  },
  {
    source: "Legal Rights",
    title: "ACLU Guide: Know Your Rights - Airport Security",
    content: "The American Civil Liberties Union outlines essential rights for transgender travelers at airport security checkpoints. This includes the right to opt-out of AIT scanners, request private screening, and travel with medically necessary items. The guide emphasizes that discrimination based on gender identity is prohibited.",
    lastUpdated: new Date().toISOString(),
    url: "https://www.aclu.org/know-your-rights/lgbtq-rights#what-are-my-rights-at-airports-and-other-ports-of-entry",
    tags: ["legal", "rights", "security", "screening"]
  },
  {
    source: "Legal Resources",
    title: "Lambda Legal: Trans Travel Rights",
    content: "Lambda Legal provides detailed information about transgender travelers' legal protections and rights. The resource covers documentation requirements, interactions with security personnel, and steps to take if discrimination occurs. It includes specific guidance for international travel and state-to-state travel within the US.",
    lastUpdated: new Date().toISOString(),
    url: "https://www.lambdalegal.org/know-your-rights/article/trans-travel-rights",
    tags: ["legal", "rights", "international", "discrimination"]
  },
  {
    source: "General Information",
    title: "Transportation Resources",
    content: "Transportation information and resources for all travelers. Find information about documentation requirements, security screening procedures, and passenger rights. Key recommendations include: carrying valid identification, arriving early for screening, and knowing your rights as a passenger.",
    lastUpdated: new Date().toISOString(),
    url: "/",
    tags: ["general", "transportation", "travel", "resources"]
  },
  {
    source: "Documentation",
    title: "Travel Documentation Guide",
    content: "Essential guide to travel documentation and identification requirements. Learn about acceptable forms of ID, how to ensure your documentation is up to date, and what to do if you encounter issues. Includes information about passport requirements and state ID policies.",
    lastUpdated: new Date().toISOString(),
    url: "/documentation",
    tags: ["documentation", "identification", "passport", "id"]
  },
  {
    source: "Security",
    title: "Security Screening Information",
    content: "Comprehensive overview of security screening procedures and passenger rights. Topics include: screening technology, private screening options, medical device accommodations, and TSA PreCheck enrollment. Contact TSA Cares (1-855-787-2227) for additional assistance.",
    lastUpdated: new Date().toISOString(),
    url: "/screening",
    tags: ["security", "screening", "airport", "tsa"]
  }
];

// General scraper for other URLs
async function scrapeWithAxios(url) {
  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    
    // Try different selectors to find content
    const contentSelectors = [
      'main', 
      'article', 
      '.content', 
      '#content',
      '.entry-content',
      '.page-content'
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
      console.error(`No content found for ${url}`);
      return null;
    }

    // Get the page title
    const title = $('h1').first().text().trim() || $('title').text().trim();
    
    // Determine source from URL
    const hostname = new URL(url).hostname.replace('www.', '');
    const source = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);

    return {
      source: source,
      title: title,
      content: content.substring(0, 1500), // Limit content length
      lastUpdated: new Date().toISOString(),
      url: url,
      tags: determineTagsFromContent(title, content)
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Function to determine tags based on content
function determineTagsFromContent(title, content) {
  const tags = [];
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const tagKeywords = {
    'documentation': ['passport', 'id', 'document', 'identification', 'gender marker', 'sex marker'],
    'security': ['security', 'screening', 'airport', 'tsa'],
    'legal': ['legal', 'rights', 'law', 'discrimination', 'protection'],
    'healthcare': ['healthcare', 'medical', 'medicine', 'doctor', 'hormone', 'therapy'],
    'international': ['international', 'country', 'foreign', 'abroad', 'destination'],
    'safety': ['safety', 'safe', 'risk', 'danger', 'warning', 'advisory'],
    'immigration': ['immigration', 'immigrant', 'visa', 'asylum', 'refugee']
  };
  
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => lowerTitle.includes(keyword) || lowerContent.includes(keyword))) {
      tags.push(tag);
    }
  });
  
  // Add at least one tag if none were found
  if (tags.length === 0) {
    tags.push('general');
  }
  
  return tags;
}

async function main() {
  console.log('Starting comprehensive scraping process...');
  ensurePublicDirectory();

  try {
    console.log('Scraping core sources...');
    // Core specialized scrapers
    const stateDeptData = await scrapeStateDept();
    const gardenStateData = await scrapeGardenState();
    const lambdaLegalData = await scrapeLambdaLegal();
    
    console.log('Scraping additional specialized sources...');
    // Additional specialized scrapers
    const additionalSourcesData = await scrapeAdditionalSources();
    
    console.log('Generating static resources for sources that cannot be scraped...');
    // Generate static resources for sources that can't be scraped
    const staticResourcesData = generateStaticResources();
    
    console.log('Scraping general sources...');
    // General sources with standard scraper
    const additionalUrls = [
      'https://transequality.org/know-your-rights/airport-security',
      'https://www.aclu.org/know-your-rights/lgbtq-rights'
    ];
    
    const generalResults = await Promise.all(
      additionalUrls.map(url => scrapeWithAxios(url))
    );
    
    // Combine all results
    let allResults = [
      stateDeptData,
      gardenStateData,
      lambdaLegalData,
      ...additionalSourcesData,
      ...staticResourcesData,
      ...generalResults.filter(result => result !== null)
    ];
    
    // Add tags to core sources if they don't have them
    allResults = allResults.map(item => {
      if (!item.tags) {
        item.tags = determineTagsFromContent(item.title, item.content);
      }
      if (!item.name) {
        item.name = item.title;
      }
      return item;
    });
    
    // Check if we have valid results, otherwise use fallback
    if (allResults.filter(result => result !== null).length === 0) {
      console.log('No valid results obtained from scraping, using fallback content');
      allResults = fallbackContent.map(item => {
        if (!item.tags) {
          item.tags = determineTagsFromContent(item.title, item.content);
        }
        if (!item.name) {
          item.name = item.title;
        }
        return item;
      });
    } else {
      // Add the general resources from fallback only if we don't have enough content
      if (allResults.length < 10) {
        const generalFallback = fallbackContent.slice(3).map(item => {
          if (!item.tags) {
            item.tags = determineTagsFromContent(item.title, item.content);
          }
          if (!item.name) {
            item.name = item.title;
          }
          return item;
        });
        allResults = [...allResults, ...generalFallback];
      }
    }
    
    // Filter out any null results
    const finalContent = allResults.filter(result => result !== null);

    // Sort by date
    finalContent.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    // Save to public directory
    const outputPath = path.join(process.cwd(), 'public', 'scraped-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalContent, null, 2));
    console.log('Data saved successfully to:', outputPath);
    
    // Print summary of scraped data
    console.log(`Scraped ${finalContent.length} sources:`);
    finalContent.forEach(item => {
      const tagsString = item.tags ? ` (${item.tags.join(', ')})` : '';
      console.log(`- ${item.source}: ${item.title}${tagsString}`);
    });
  } catch (error) {
    console.error('Error in main scraping process:', error);
    // Save fallback content if scraping fails completely
    const outputPath = path.join(process.cwd(), 'public', 'scraped-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(fallbackContent, null, 2));
    console.log('Fallback content saved successfully');
  }
}

main(); 