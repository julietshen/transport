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
 * Fallback content for Lambda Legal TGNC travel checklist
 * Updated with 2025 information as requested
 */
const fallbackContent = {
  source: "Lambda Legal",
  title: "TGNC Rights Checklist",
  content: `As of 2025, Lambda Legal recommends transgender and gender non-conforming individuals take the following precautions before and during travel: 1) Ensure all identification documents are consistent with your gender presentation where possible; 2) Carry copies of court orders or medical documentation related to your gender transition; 3) Research the laws of your destination regarding gender identity protections; 4) Have contact information for LGBTQ-friendly legal resources at your destination; 5) Consider privacy and security when booking accommodations; 6) Be aware of your rights during security screenings; and 7) Document any incidents of discrimination or harassment.`,
  lastUpdated: "2025-03-10T00:00:00.000Z",
  url: "https://lambdalegal.org/tgnc-checklist-under-trump/"
};

/**
 * Scrape the Lambda Legal website for TGNC checklist information
 */
async function scrapeLambdaLegal() {
  const url = 'https://lambdalegal.org/tgnc-checklist-under-trump/';
  
  try {
    console.log('Attempting to scrape Lambda Legal website with Axios...');
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    
    // Try to locate the main content using various potential selectors
    const contentSelectors = [
      '.entry-content',
      'article',
      '.content-area',
      '.post-content',
      'main',
      '#main-content'
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
      throw new Error('Content not found with Axios, trying Puppeteer');
    }
    
    // Extract the title
    const title = $('h1').first().text().trim() || "TGNC Rights Checklist";
    
    return {
      source: "Lambda Legal",
      title: title,
      content: content.substring(0, 1500), // Limit content length
      lastUpdated: new Date().toISOString(),
      url: url
    };
  } catch (axiosError) {
    console.log('Axios scraping failed, attempting with Puppeteer...');
    
    try {
      // Use Puppeteer for more complex page rendering
      const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      
      // Set a reasonable timeout
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for content to be available
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Extract content from various potential selectors
      const content = await page.evaluate(() => {
        const selectors = ['.entry-content', 'article', '.content-area', '.post-content', 'main', '#main-content'];
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim().length > 100) {
            return element.textContent.trim();
          }
        }
        return '';
      });
      
      // Extract the title
      const title = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent.trim() : "TGNC Rights Checklist";
      });
      
      await browser.close();
      
      if (!content) {
        console.log('No content found with Puppeteer, using fallback content');
        return fallbackContent;
      }
      
      return {
        source: "Lambda Legal",
        title: title,
        content: content.substring(0, 1500), // Limit content length
        lastUpdated: new Date().toISOString(),
        url: url
      };
    } catch (puppeteerError) {
      console.error('Puppeteer scraping failed:', puppeteerError);
      console.log('Using fallback content for Lambda Legal');
      return fallbackContent;
    }
  }
}

module.exports = { scrapeLambdaLegal }; 