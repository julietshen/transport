const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

export interface ScrapedData {
  source: string;
  title: string;
  content: string;
  lastUpdated: string;
  url: string;
}

export async function scrapeStateDepartment(): Promise<ScrapedData> {
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html', {
      waitUntil: 'networkidle0'
    });

    const content = await page.content();
    const $ = cheerio.load(content);

    const mainContent = $('.main-content');
    const title = mainContent.find('h1').first().text().trim() || 'Passport Gender Marker Information';
    const contentText = mainContent.text().trim() || 'Content not available';
    const lastUpdated = $('.last-updated').text().trim() || new Date().toISOString();

    await browser.close();

    return {
      source: 'US State Department',
      title,
      content: contentText,
      lastUpdated,
      url: 'https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html'
    };
  } catch (error) {
    console.error('Error scraping State Department:', error);
    return {
      source: 'US State Department',
      title: 'Error: Could not fetch data',
      content: 'The information is temporarily unavailable. Please visit the website directly.',
      lastUpdated: new Date().toISOString(),
      url: 'https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html'
    };
  }
}

export async function scrapeGardenState(): Promise<ScrapedData> {
  try {
    const response = await axios.get('https://www.gardenstateequality.org/release-travel-advisory-for-nonbinary-and-trans-new-jersey-residents/');
    const $ = cheerio.load(response.data);

    const title = $('h1').first().text().trim() || 'NJ Travel Advisory';
    const content = $('.entry-content').text().trim() || 'Content not available';
    const lastUpdated = $('.entry-date').text().trim() || new Date().toISOString();

    return {
      source: 'Garden State Equality',
      title,
      content,
      lastUpdated,
      url: 'https://www.gardenstateequality.org/release-travel-advisory-for-nonbinary-and-trans-new-jersey-residents/'
    };
  } catch (error) {
    console.error('Error scraping Garden State:', error);
    return {
      source: 'Garden State Equality',
      title: 'Error: Could not fetch data',
      content: 'The information is temporarily unavailable. Please visit the website directly.',
      lastUpdated: new Date().toISOString(),
      url: 'https://www.gardenstateequality.org/release-travel-advisory-for-nonbinary-and-trans-new-jersey-residents/'
    };
  }
}

export async function scrapeLambdaLegal(): Promise<ScrapedData> {
  try {
    const response = await axios.get('https://lambdalegal.org/tgnc-checklist-under-trump/');
    const $ = cheerio.load(response.data);

    const title = $('h1').first().text().trim() || 'Trans Rights Checklist';
    const content = $('.content').text().trim() || 'Content not available';
    const lastUpdated = $('.date').text().trim() || new Date().toISOString();

    return {
      source: 'Lambda Legal',
      title,
      content,
      lastUpdated,
      url: 'https://lambdalegal.org/tgnc-checklist-under-trump/'
    };
  } catch (error) {
    console.error('Error scraping Lambda Legal:', error);
    return {
      source: 'Lambda Legal',
      title: 'Error: Could not fetch data',
      content: 'The information is temporarily unavailable. Please visit the website directly.',
      lastUpdated: new Date().toISOString(),
      url: 'https://lambdalegal.org/tgnc-checklist-under-trump/'
    };
  }
}

export async function scrapeAllSources(): Promise<ScrapedData[]> {
  try {
    const [stateDept, gardenState, lambdaLegal] = await Promise.all([
      scrapeStateDepartment(),
      scrapeGardenState(),
      scrapeLambdaLegal()
    ]);

    const data = [stateDept, gardenState, lambdaLegal];
    
    // Ensure the public directory exists
    await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
    
    // Save to JSON file
    await fs.writeFile(
      path.join(process.cwd(), 'public', 'scraped-data.json'),
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
}

module.exports = {
  scrapeAllSources,
  scrapeStateDepartment,
  scrapeGardenState,
  scrapeLambdaLegal
}; 