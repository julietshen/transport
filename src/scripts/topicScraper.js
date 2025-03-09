/**
 * topicScraper.js
 * Main script for topic-based scraping of transgender travel resources
 */

// Import required modules
const { TopicScraper } = require('../scrapers/base/TopicScraper');
const { topicsConfig } = require('../config/topics');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * NewsSourceScraper - Scrapes news sources for relevant content based on configured topics
 */
class NewsSourceScraper extends TopicScraper {
  constructor() {
    super('news', 'Current News Sources', topicsConfig.topics);
    this.sources = [
      {
        name: 'Erin In The Morning',
        url: 'https://erininthemorn.substack.com/',
        baseUrl: 'https://erininthemorn.substack.com'
      },
      {
        name: 'The Advocate',
        url: 'https://www.advocate.com/transgender',
        baseUrl: 'https://www.advocate.com'
      },
      {
        name: 'Them',
        url: 'https://www.them.us/identity/transgender',
        baseUrl: 'https://www.them.us'
      }
    ];
  }

  async scrape() {
    console.log('Starting to scrape news sources...');
    const results = [];

    for (const source of this.sources) {
      try {
        console.log(`Scraping ${source.name}...`);
        const articles = await this.scrapeNewsSource(source);
        results.push(...articles);
      } catch (error) {
        this.handleError(error, `scraping ${source.name}`);
      }
    }

    if (results.length > 0) {
      await this.saveToContentQueue(results);
    }

    return results;
  }

  async scrapeNewsSource(source) {
    const results = [];
    try {
      // Fetch the HTML content
      const response = await this.axiosInstance.get(source.url);
      const $ = cheerio.load(response.data);
      
      // Find article links - these selectors might need adjustment for each site
      const articleSelectors = [
        'article a', 
        '.post-card a', 
        '.headline a', 
        '.article-title a',
        '.post-title a',
        '.article a'
      ];
      
      const links = new Set();
      
      // Try different selectors to find links
      for (const selector of articleSelectors) {
        $(selector).each((_, element) => {
          let href = $(element).attr('href');
          if (href) {
            // Handle relative URLs
            if (href.startsWith('/')) {
              href = `${source.baseUrl}${href}`;
            }
            // Only add unique links that are from the same domain
            if (href.includes(source.baseUrl.replace('https://', ''))) {
              links.add(href);
            }
          }
        });
      }
      
      // Process the first 5 links (to avoid overloading)
      const linksArray = Array.from(links).slice(0, 5);
      
      // Process each article
      for (const url of linksArray) {
        try {
          const articleData = await this.scrapeArticle(url, source.name);
          if (articleData) {
            results.push(articleData);
          }
        } catch (error) {
          this.handleError(error, `scraping article ${url}`);
        }
      }
    } catch (error) {
      this.handleError(error, `scraping source ${source.name}`);
    }
    
    return results;
  }

  async scrapeArticle(url, sourceName) {
    try {
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);
      
      // Get article title
      const titleSelectors = ['h1', '.article-title', '.post-title', '.headline'];
      let title = '';
      
      for (const selector of titleSelectors) {
        const foundTitle = $(selector).first().text().trim();
        if (foundTitle) {
          title = foundTitle;
          break;
        }
      }
      
      if (!title) {
        title = $('title').text().trim();
      }
      
      // Get article content
      const contentSelectors = [
        'article', 
        '.article-content', 
        '.post-content',
        '.content',
        '.article-body'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const foundContent = $(selector).text().trim();
        if (foundContent && foundContent.length > 100) {
          content = foundContent;
          break;
        }
      }
      
      // If no content found, skip this article
      if (!content) {
        return null;
      }
      
      // Find date
      const dateSelectors = [
        '.article-date', 
        '.post-date',
        'time',
        '.date',
        'meta[property="article:published_time"]'
      ];
      
      let dateStr = '';
      for (const selector of dateSelectors) {
        let element = $(selector);
        if (element.length > 0) {
          if (selector.includes('meta')) {
            dateStr = element.attr('content');
          } else {
            dateStr = element.text().trim();
          }
          break;
        }
      }
      
      let lastUpdated = new Date();
      if (dateStr) {
        try {
          lastUpdated = new Date(dateStr);
        } catch (e) {
          // Use current date if parsing fails
        }
      }
      
      // Find matching topics
      const matchingTopics = this.findMatchingTopics(content, title);
      
      // Only return the article if it matches at least one topic
      if (matchingTopics.length === 0) {
        return null;
      }
      
      // Get tags from matching topics
      const tags = matchingTopics.map(topic => topic.id);
      
      // Get primary category from highest priority matching topic
      const primaryTopic = matchingTopics.reduce((highest, current) => 
        current.priority > highest.priority ? current : highest, matchingTopics[0]);
      
      return {
        source: sourceName,
        title: title,
        content: content.substring(0, 1500), // Limit content length
        lastUpdated: lastUpdated.toISOString(),
        url: url,
        tags: tags,
        primaryCategory: primaryTopic.category
      };
    } catch (error) {
      this.handleError(error, `scraping article ${url}`);
      return null;
    }
  }
}

/**
 * OrganizationScraper - Scrapes advocacy organizations for relevant content
 */
class OrganizationScraper extends TopicScraper {
  constructor() {
    super('orgs', 'Advocacy Organizations', topicsConfig.topics);
    this.sources = [
      {
        name: 'National Center for Transgender Equality',
        url: 'https://transequality.org/know-your-rights',
        baseUrl: 'https://transequality.org'
      },
      {
        name: 'Lambda Legal',
        url: 'https://www.lambdalegal.org/know-your-rights',
        baseUrl: 'https://www.lambdalegal.org'
      },
      {
        name: 'Transgender Law Center',
        url: 'https://transgenderlawcenter.org/resources',
        baseUrl: 'https://transgenderlawcenter.org'
      }
    ];
  }

  async scrape() {
    console.log('Starting to scrape advocacy organizations...');
    const results = [];

    for (const source of this.sources) {
      try {
        console.log(`Scraping ${source.name}...`);
        const resources = await this.scrapeOrganization(source);
        results.push(...resources);
      } catch (error) {
        this.handleError(error, `scraping ${source.name}`);
      }
    }

    if (results.length > 0) {
      await this.saveToContentQueue(results);
    }

    return results;
  }

  async scrapeOrganization(source) {
    // Implementation similar to the news source scraper but tailored for organizations
    // ...implementing organization-specific scraping logic
    const results = [];
    try {
      // Fetch the HTML content
      const response = await this.axiosInstance.get(source.url);
      const $ = cheerio.load(response.data);
      
      // Find resource links - tailored for organizations
      const resourceSelectors = [
        '.resource a', 
        '.resources a', 
        '.know-your-rights a', 
        '.page-content a',
        'article a'
      ];
      
      const links = new Set();
      
      // Try different selectors to find links
      for (const selector of resourceSelectors) {
        $(selector).each((_, element) => {
          let href = $(element).attr('href');
          if (href) {
            // Handle relative URLs
            if (href.startsWith('/')) {
              href = `${source.baseUrl}${href}`;
            }
            // Only add unique links that are from the same domain
            if (href.includes(source.baseUrl.replace('https://', ''))) {
              links.add(href);
            }
          }
        });
      }
      
      // Process the first 5 links (to avoid overloading)
      const linksArray = Array.from(links).slice(0, 5);
      
      // Process each resource
      for (const url of linksArray) {
        try {
          const resourceData = await this.scrapeResource(url, source.name);
          if (resourceData) {
            results.push(resourceData);
          }
        } catch (error) {
          this.handleError(error, `scraping resource ${url}`);
        }
      }
    } catch (error) {
      this.handleError(error, `scraping organization ${source.name}`);
    }
    
    return results;
  }

  async scrapeResource(url, sourceName) {
    // Similar implementation to scrapeArticle but tailored for organizations
    // ...organization resource scraping logic
    // Would follow a similar pattern to the scrapeArticle method
    try {
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);
      
      // Get resource title
      const titleSelectors = ['h1', '.page-title', '.resource-title', '.title'];
      let title = '';
      
      for (const selector of titleSelectors) {
        const foundTitle = $(selector).first().text().trim();
        if (foundTitle) {
          title = foundTitle;
          break;
        }
      }
      
      if (!title) {
        title = $('title').text().trim();
      }
      
      // Get resource content
      const contentSelectors = [
        '.content', 
        '.page-content', 
        '.resource-content',
        'article',
        '.main-content'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const foundContent = $(selector).text().trim();
        if (foundContent && foundContent.length > 100) {
          content = foundContent;
          break;
        }
      }
      
      // If no content found, skip this resource
      if (!content) {
        return null;
      }
      
      // Find matching topics
      const matchingTopics = this.findMatchingTopics(content, title);
      
      // Only return the resource if it matches at least one topic
      if (matchingTopics.length === 0) {
        return null;
      }
      
      // Get tags from matching topics
      const tags = matchingTopics.map(topic => topic.id);
      
      // Get primary category from highest priority matching topic
      const primaryTopic = matchingTopics.reduce((highest, current) => 
        current.priority > highest.priority ? current : highest, matchingTopics[0]);
      
      return {
        source: sourceName,
        title: title,
        content: content.substring(0, 1500), // Limit content length
        lastUpdated: new Date().toISOString(), // Most orgs don't have clear dates
        url: url,
        tags: tags,
        primaryCategory: primaryTopic.category
      };
    } catch (error) {
      this.handleError(error, `scraping resource ${url}`);
      return null;
    }
  }
}

/**
 * GovernmentScraper - Scrapes government sources for relevant travel information
 */
class GovernmentScraper extends TopicScraper {
  constructor() {
    super('govt', 'Government Sources', topicsConfig.topics);
    this.sources = [
      {
        name: 'State Department Travel Advisories',
        url: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/',
        baseUrl: 'https://travel.state.gov'
      }
    ];
  }

  async scrape() {
    console.log('Starting to scrape government sources...');
    const results = [];

    // Implementation for government sources... would follow similar pattern
    // ...government-specific scraping implementation
    
    return results;
  }
}

/**
 * Main function to run all scrapers
 */
async function main() {
  const startTime = new Date();
  console.log(`Topic scraper started at ${startTime.toISOString()}`);
  
  // Create and run scrapers
  const scrapers = [
    new NewsSourceScraper(),
    new OrganizationScraper(),
    new GovernmentScraper()
  ];
  
  const results = [];
  
  for (const scraper of scrapers) {
    try {
      const scraperResults = await scraper.scrape();
      results.push(...scraperResults);
      console.log(`Completed scraping with ${scraper.constructor.name}, found ${scraperResults.length} items`);
    } catch (error) {
      console.error(`Error in ${scraper.constructor.name}:`, error);
    }
  }
  
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`Topic scraper completed at ${endTime.toISOString()}`);
  console.log(`Total duration: ${duration} seconds`);
  console.log(`Total items found: ${results.length}`);
}

// Run the main function
main().catch(error => {
  console.error('Fatal error in topic scraper:', error);
  process.exit(1);
}); 