/**
 * Type definitions related to travel resources and scraped data
 */

/**
 * Represents a single data entry scraped from various trans travel information sources
 */
export interface ScrapedData {
  source: string;
  title: string;
  content: string;
  lastUpdated: string;
  url: string;
  tags?: string[];
  name?: string;
  category?: string;
} 