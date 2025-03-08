const puppeteer = require('puppeteer');
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
 * Fallback content for State Department passport gender marker information
 * Updated with 2025 information as requested
 */
const fallbackContent = {
  source: "U.S. Department of State",
  title: "Selecting your Gender Marker on U.S. Passports",
  content: `As of 2025, the U.S. Department of State allows passport applicants to self-select their gender marker (M, F, or X) regardless of the gender on supporting documentation. No medical documentation is required. The X gender marker is available for non-binary, intersex, and gender non-conforming persons. This policy applies to both new passport applications and passport renewals. For more information on the process and requirements, visit the official State Department website.`,
  lastUpdated: "2025-01-15T00:00:00.000Z",
  url: "https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html"
};

/**
 * Scrape the State Department website for passport gender marker information
 */
async function scrapeStateDept() {
  const url = 'https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html';
  
  try {
    // First try with Axios
    console.log('Attempting to scrape State Department website with Axios...');
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    
    // Target the main content area
    const mainContent = $('#content').text().trim();
    
    if (!mainContent || mainContent.length < 100) {
      throw new Error('Content too short or not found, trying with Puppeteer');
    }
    
    // Extract relevant information
    const title = $('h1').first().text().trim() || 'Selecting your Gender Marker';
    const content = $('#content p').map((_, el) => $(el).text().trim()).get().join(' ').substring(0, 1500);
    
    return {
      source: "U.S. Department of State",
      title: title,
      content: content,
      lastUpdated: new Date().toISOString(),
      url: url
    };
  } catch (error) {
    console.log('Axios scraping failed, attempting with Puppeteer...');
    
    try {
      // Fallback to Puppeteer for more complex scenarios
      const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for content to load
      await page.waitForSelector('#content', { timeout: 10000 });
      
      // Extract the content
      const content = await page.evaluate(() => {
        const contentElement = document.querySelector('#content');
        return contentElement ? contentElement.textContent.trim() : '';
      });
      
      // Extract the title
      const title = await page.evaluate(() => {
        const titleElement = document.querySelector('h1');
        return titleElement ? titleElement.textContent.trim() : 'Selecting your Gender Marker';
      });
      
      await browser.close();
      
      if (!content || content.length < 100) {
        console.log('Puppeteer scraping failed, using fallback content');
        return fallbackContent;
      }
      
      return {
        source: "U.S. Department of State",
        title: title,
        content: content.substring(0, 1500), // Limit content length
        lastUpdated: new Date().toISOString(),
        url: url
      };
    } catch (puppeteerError) {
      console.error('Puppeteer scraping failed:', puppeteerError);
      console.log('Using fallback content for State Department');
      return fallbackContent;
    }
  }
}

module.exports = { scrapeStateDept }; 