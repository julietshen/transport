const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// List of sources to scrape
const sourcesToScrape = [
  // Official Government Sources
  {
    url: 'https://travel.state.gov/content/travel/en/international-travel/before-you-go/travelers-with-special-considerations/lgbti.html',
    name: 'State Department LGBTQI+ Travel Information',
    category: 'Government',
    tags: ['international', 'documentation', 'safety', 'legal'],
    fallback: 'The U.S. Department of State provides information specific to LGBTQI+ travelers, including country-specific advisories, considerations for family travel, and resources for emergency situations abroad. The page highlights potential legal issues in countries where LGBTQI+ status or conduct is criminalized and offers registration information for the Smart Traveler Enrollment Program (STEP).'
  },
  {
    url: 'https://www.tsa.gov/transgender-passengers',
    name: 'TSA Transgender Passenger Information',
    category: 'Government',
    tags: ['security', 'screening', 'documentation'],
    fallback: 'The Transportation Security Administration (TSA) provides guidance for transgender passengers navigating airport security. The resource outlines AIT screening procedures, ID verification processes, and options for private screening. It also explains how to contact TSA Cares for additional assistance before traveling and emphasizes that all travelers must be screened regardless of gender identity.'
  },
  {
    url: 'https://www.usa.gov/passport',
    name: 'USA.gov Passport Information',
    category: 'Government',
    tags: ['documentation', 'passport', 'identification'],
    fallback: 'USA.gov provides comprehensive information about passport applications, renewals, and gender marker changes. The resource covers required documentation, processing times, expedited service options, and special considerations for various situations including gender marker updates.'
  },

  // Legal and Advocacy Organizations
  {
    url: 'https://transequality.org/know-your-rights/airports-and-tsa',
    name: 'National Center for Transgender Equality - Airport Rights',
    category: 'Legal',
    tags: ['security', 'screening', 'legal', 'rights'],
    fallback: 'The National Center for Transgender Equality provides a detailed guide for transgender travelers navigating airport security. It covers ID requirements, security screening procedures, medical equipment considerations, and strategies for addressing potential issues. The guide emphasizes travelers\' rights and offers contact information for reporting discrimination.'
  },
  {
    url: 'https://www.aclu.org/know-your-rights/lgbtq-rights',
    name: 'ACLU LGBTQ Rights',
    category: 'Legal',
    tags: ['legal', 'rights', 'discrimination'],
    fallback: 'The American Civil Liberties Union provides information about LGBTQ rights in various contexts, including travel. The resource outlines legal protections against discrimination, explains how to identify civil rights violations, and offers guidance for taking action when rights are violated.'
  },
  {
    url: 'https://transgenderlawcenter.org/resources',
    name: 'Transgender Law Center Resources',
    category: 'Legal',
    tags: ['legal', 'resources', 'documentation'],
    fallback: 'The Transgender Law Center offers comprehensive legal resources for transgender individuals, including guidance on ID documentation, travel concerns, and addressing discrimination. The resource hub includes state-specific information about identity document policies and procedures for legal name and gender marker changes.'
  },

  // International Travel Resources
  {
    url: 'https://ilga.org/',
    name: 'ILGA World - International LGBTI Association',
    category: 'International',
    tags: ['international', 'legal', 'safety'],
    fallback: 'ILGA World provides global information about laws affecting LGBTI people, including maps and country-specific details that are essential for international travelers. The resource offers information about countries where same-sex relationships are criminalized, legal protections exist, and locations where transgender rights are recognized.'
  },
  {
    url: 'https://www.equaldex.com/',
    name: 'Equaldex - Global LGBTQ Rights Index',
    category: 'International',
    tags: ['international', 'legal', 'safety', 'rights'],
    fallback: 'Equaldex is a collaborative database of LGBTQ rights by country and region. The resource provides visual maps and detailed country profiles covering legal status of same-sex relationships, gender identity recognition, discrimination protections, and public opinion data.'
  },

  // Healthcare Resources
  {
    url: 'https://www.wpath.org/resources',
    name: 'WPATH Resources',
    category: 'Healthcare',
    tags: ['healthcare', 'medical', 'resources'],
    fallback: 'The World Professional Association for Transgender Health provides resources for transgender individuals, including information about accessing healthcare while traveling. The resource includes guidance for carrying hormone medications, documentation recommendations for medical devices or prescriptions, and considerations for emergency healthcare access while away from home.'
  },
  {
    url: 'https://www.cdc.gov/lgbthealth/transgender-persons.htm',
    name: 'CDC - Transgender Health',
    category: 'Healthcare',
    tags: ['healthcare', 'safety'],
    fallback: 'The Centers for Disease Control and Prevention provides health information for transgender individuals, including considerations for travelers. The resource covers preventive health measures, vaccination recommendations, and guidance for addressing healthcare needs while traveling domestically or internationally.'
  }
];

// Static resources that shouldn't be scraped but should be included
const staticResources = [
  // Community Resources
  {
    name: 'Refuge Restrooms',
    category: 'Community',
    source: 'Refuge Restrooms',
    title: 'Refuge Restrooms - Find Safe Restroom Access',
    content: 'Refuge Restrooms is a mobile-friendly web application that helps transgender, intersex, and gender non-conforming individuals find safe restroom access. The app allows users to search for and add safe restroom locations based on geographic location, provides directions, and includes user comments and ratings. Available via website or as a mobile application.',
    url: 'https://www.refugerestrooms.org/',
    lastUpdated: new Date().toISOString(),
    tags: ['safety', 'resources', 'community']
  },
  {
    name: 'Lex',
    category: 'Community',
    source: 'Lex',
    title: 'Lex - Text-Centered Community Platform',
    content: 'Lex is a text-centered community app for the LGBTQ+ community that can help travelers connect with local communities and resources while on the road. The platform allows users to post personal ads and social messages, search by location, and connect with other users through direct messaging.',
    url: 'https://thisislex.app/',
    lastUpdated: new Date().toISOString(),
    tags: ['community', 'resources', 'social']
  },
  
  // Digital Tools and Apps
  {
    name: 'GeoSure',
    category: 'Digital Tools',
    source: 'GeoSure',
    title: 'GeoSure - Safety Information for LGBTQ+ Travelers',
    content: 'GeoSure provides safety scores for locations worldwide, including specific ratings for LGBTQ+ travelers. The app uses a combination of data sources and user feedback to generate safety scores at the neighborhood level, helping travelers make informed decisions about destinations and accommodations.',
    url: 'https://geosureglobal.com/',
    lastUpdated: new Date().toISOString(),
    tags: ['safety', 'international', 'digital']
  },
  {
    name: 'TravelSafer',
    category: 'Digital Tools',
    source: 'TravelSafer',
    title: 'TravelSafer - Emergency Location Sharing',
    content: 'TravelSafer is an emergency app that allows users to share their location with trusted contacts with one tap. The app includes an emergency button that will send alerts with the user\'s exact location, can be set to automatically trigger alerts if check-ins are missed, and works in over 200 countries.',
    url: 'https://travelsafer.io/',
    lastUpdated: new Date().toISOString(),
    tags: ['safety', 'digital', 'emergency']
  },
  {
    name: 'Solace',
    category: 'Digital Tools',
    source: 'Solace',
    title: 'Solace - Transgender Resource Navigation App',
    content: 'Solace is an app designed to help transgender individuals navigate their transitions, including information about documentation and travel. The app provides personalized, step-by-step guidance for document updates, connects users with local resources, and offers information about ID and travel document requirements.',
    url: 'https://solace.lgbt/',
    lastUpdated: new Date().toISOString(),
    tags: ['documentation', 'resources', 'digital']
  },
  
  // International Organizations
  {
    name: 'OutRight Action International',
    category: 'International',
    source: 'OutRight Action International',
    title: 'OutRight Action International - Global LGBTIQ Rights',
    content: 'OutRight Action International works to advance human rights for LGBTIQ people around the world and provides valuable resources for international travelers. The organization publishes country-specific reports, maintains a global issues tracker, and offers emergency response resources for LGBTIQ individuals facing persecution or emergencies while traveling.',
    url: 'https://outrightinternational.org/',
    lastUpdated: new Date().toISOString(),
    tags: ['international', 'legal', 'rights', 'emergency']
  },
  
  // Healthcare Directories
  {
    name: 'GLMA Provider Directory',
    category: 'Healthcare',
    source: 'GLMA',
    title: 'GLMA - Healthcare Provider Directory',
    content: 'The GLMA Provider Directory helps travelers locate LGBTQ+ affirming healthcare providers across the United States. The searchable database includes providers who have committed to creating welcoming environments for LGBTQ+ patients, with filters for specialty, location, and insurance acceptance.',
    url: 'https://www.glma.org/directory/',
    lastUpdated: new Date().toISOString(),
    tags: ['healthcare', 'resources', 'directory']
  },
  
  // Transportation Resources
  {
    name: 'TSA PreCheck',
    category: 'Transportation',
    source: 'TSA',
    title: 'TSA PreCheck for Smoother Security Screening',
    content: 'TSA PreCheck allows eligible travelers to experience expedited security screening at participating U.S. airports. Transgender travelers enrolled in PreCheck may experience less intrusive screening, shorter wait times, and fewer potential complications during the security process. The service requires application, background check, and fee.',
    url: 'https://www.tsa.gov/precheck',
    lastUpdated: new Date().toISOString(),
    tags: ['security', 'screening', 'transportation']
  },
  
  // Emergency Resources
  {
    name: 'Smart Traveler Enrollment Program (STEP)',
    category: 'Emergency',
    source: 'U.S. Department of State',
    title: 'Smart Traveler Enrollment Program (STEP)',
    content: 'STEP is a free service allowing U.S. citizens traveling or living abroad to register their trip with the nearest U.S. Embassy or Consulate. Benefits include receiving important information about safety conditions, contact information for the nearest U.S. embassy or consulate, and assistance during emergencies such as natural disasters or civil unrest.',
    url: 'https://step.state.gov/',
    lastUpdated: new Date().toISOString(),
    tags: ['international', 'emergency', 'safety', 'government']
  }
];

// Attempt to scrape with Axios
async function scrapeWithAxios(sourceInfo) {
  try {
    console.log(`Scraping ${sourceInfo.name} with Axios...`);
    const response = await axiosInstance.get(sourceInfo.url);
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
        content = selectedContent.replace(/\s+/g, ' ');
        break;
      }
    }
    
    // If no content found with primary selectors, try getting the body content
    if (!content) {
      content = $('body').text().trim().replace(/\s+/g, ' ').substring(0, 1500);
    }
    
    // Get the page title
    const title = $('h1').first().text().trim() || $('title').text().trim();
    
    return {
      source: sourceInfo.category,
      name: sourceInfo.name,
      title: title || sourceInfo.name,
      content: content.substring(0, 1500), // Limit content length
      lastUpdated: new Date().toISOString(),
      url: sourceInfo.url,
      tags: sourceInfo.tags
    };
  } catch (error) {
    console.error(`Error scraping ${sourceInfo.name} with Axios:`, error.message);
    return null;
  }
}

// Attempt to scrape with Puppeteer for JavaScript-heavy sites
async function scrapeWithPuppeteer(sourceInfo) {
  let browser = null;
  try {
    console.log(`Scraping ${sourceInfo.name} with Puppeteer...`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.goto(sourceInfo.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Try to get content from common selectors
    const content = await page.evaluate(() => {
      const contentSelectors = [
        'main', 
        'article', 
        '.content', 
        '#content',
        '.entry-content',
        '.page-content'
      ];
      
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
          return element.textContent.trim().replace(/\s+/g, ' ');
        }
      }
      
      // Fallback to body if no content found
      return document.body.textContent.trim().replace(/\s+/g, ' ').substring(0, 1500);
    });
    
    // Get the page title
    const title = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1 && h1.textContent.trim()) {
        return h1.textContent.trim();
      }
      return document.title.trim();
    });
    
    await browser.close();
    
    return {
      source: sourceInfo.category,
      name: sourceInfo.name,
      title: title || sourceInfo.name,
      content: content.substring(0, 1500), // Limit content length
      lastUpdated: new Date().toISOString(),
      url: sourceInfo.url,
      tags: sourceInfo.tags
    };
  } catch (error) {
    console.error(`Error scraping ${sourceInfo.name} with Puppeteer:`, error.message);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

// Function to scrape additional sources
async function scrapeAdditionalSources() {
  console.log('Starting to scrape additional sources...');
  const results = [];
  
  for (const source of sourcesToScrape) {
    console.log(`Processing ${source.name}...`);
    
    // Try to scrape with Axios first
    let result = await scrapeWithAxios(source);
    
    // If Axios fails, try Puppeteer
    if (!result || !result.content || result.content.length < 100) {
      result = await scrapeWithPuppeteer(source);
    }
    
    // If both methods fail, use fallback content
    if (!result || !result.content || result.content.length < 100) {
      console.log(`Using fallback content for ${source.name}`);
      result = {
        source: source.category,
        name: source.name,
        title: source.name,
        content: source.fallback,
        lastUpdated: new Date().toISOString(),
        url: source.url,
        tags: source.tags
      };
    }
    
    results.push(result);
  }
  
  return results;
}

// Function to generate static resources
function generateStaticResources() {
  return staticResources.map(resource => {
    return {
      ...resource,
      lastUpdated: new Date().toISOString()
    };
  });
}

module.exports = {
  scrapeAdditionalSources,
  generateStaticResources
}; 