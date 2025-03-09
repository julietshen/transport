/**
 * BaseScraper.ts
 * Abstract base class that defines the interface and common functionality for all scrapers
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ScrapedData } from '../../types/resources';

export abstract class BaseScraper {
  protected axiosInstance: AxiosInstance;
  protected sourceId: string;
  protected sourceName: string;

  constructor(sourceId: string, sourceName: string, options?: AxiosRequestConfig) {
    this.sourceId = sourceId;
    this.sourceName = sourceName;

    // Default options for all scrapers
    const defaultOptions: AxiosRequestConfig = {
      timeout: 30000,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    // Create axios instance with merged options
    this.axiosInstance = axios.create({
      ...defaultOptions,
      ...options
    });
  }

  /**
   * Main scraper method that must be implemented by all concrete scrapers
   * @returns Promise resolving to an array of scraped data items
   */
  public abstract scrape(): Promise<ScrapedData[]>;

  /**
   * Helper method to format scraped data to a common structure
   */
  protected formatResult(
    title: string, 
    content: string, 
    url: string, 
    tags: string[] = [], 
    lastUpdated: Date = new Date()
  ): ScrapedData {
    return {
      source: this.sourceName,
      title: title,
      content: content,
      url: url,
      tags: tags,
      lastUpdated: lastUpdated.toISOString()
    };
  }

  /**
   * Error handler for scraping errors
   */
  protected handleError(error: any, context: string): void {
    console.error(`Error in ${this.sourceId} scraper (${context}):`, error.message || error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
  }
} 