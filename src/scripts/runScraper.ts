import { scrapeAllSources } from '../scrapers/dataScraper';

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

async function main() {
  try {
    console.log('Starting data scraping...');
    const data = await scrapeAllSources();
    console.log('Data scraping completed successfully');
    console.log(`Scraped ${data.length} sources`);
    process.exit(0);
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 