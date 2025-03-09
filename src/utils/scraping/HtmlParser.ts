/**
 * HtmlParser.ts
 * A utility class for parsing HTML content for scraping operations
 */

import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

export class HtmlParser {
  private $: CheerioAPI;
  
  /**
   * Creates a new HtmlParser instance with the provided HTML content
   * @param html The HTML content to parse
   */
  constructor(html: string) {
    this.$ = cheerio.load(html);
  }
  
  /**
   * Finds text content using the first matching selector from a list
   * @param selectors Array of CSS selectors to try in order
   * @param fallback Fallback value if no selectors match
   * @returns The text content from the first matching selector, or the fallback
   */
  findText(selectors: string[], fallback: string = ''): string {
    for (const selector of selectors) {
      const element = this.$(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text) {
          return text;
        }
      }
    }
    return fallback;
  }
  
  /**
   * Finds an attribute value using the first matching selector from a list
   * @param selectors Array of CSS selectors to try in order
   * @param attribute The attribute to extract
   * @param fallback Fallback value if no selectors match
   * @returns The attribute value from the first matching selector, or the fallback
   */
  findAttribute(selectors: string[], attribute: string, fallback: string = ''): string {
    for (const selector of selectors) {
      const element = this.$(selector).first();
      if (element.length > 0) {
        const value = element.attr(attribute);
        if (value) {
          return value;
        }
      }
    }
    return fallback;
  }
  
  /**
   * Extracts all links from elements matching the provided selectors
   * @param selectors Array of CSS selectors to find links within
   * @param baseUrl Base URL to resolve relative links against
   * @returns Array of unique absolute URLs
   */
  extractLinks(selectors: string[], baseUrl: string): string[] {
    const links = new Set<string>();
    
    for (const selector of selectors) {
      this.$(selector).each((_, element) => {
        let href = this.$(element).attr('href');
        if (href) {
          // Handle relative URLs
          if (href.startsWith('/')) {
            href = `${baseUrl}${href}`;
          } else if (!href.startsWith('http')) {
            href = `${baseUrl}/${href}`;
          }
          
          // Only add links from the same domain
          if (href.includes(baseUrl.replace(/^https?:\/\//, ''))) {
            links.add(href);
          }
        }
      });
    }
    
    return Array.from(links);
  }
  
  /**
   * Extracts the main content of a page
   * @param selectors Array of CSS selectors to try for finding main content
   * @param minLength Minimum content length to consider valid
   * @returns The text content from the first valid selector, or empty string
   */
  extractMainContent(selectors: string[], minLength: number = 100): string {
    for (const selector of selectors) {
      const content = this.$(selector).text().trim();
      if (content && content.length >= minLength) {
        return content;
      }
    }
    return '';
  }
  
  /**
   * Attempts to find a date from the document using common selectors
   * @param selectors Array of CSS selectors to try for finding dates
   * @returns Date object if found, current date otherwise
   */
  findDate(selectors: string[]): Date {
    for (const selector of selectors) {
      const element = this.$(selector);
      if (element.length > 0) {
        let dateStr = '';
        
        if (selector.includes('meta')) {
          dateStr = element.attr('content') || '';
        } else {
          dateStr = element.text().trim();
        }
        
        if (dateStr) {
          try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      }
    }
    
    return new Date();
  }
  
  /**
   * Gets the raw cheerio instance for direct manipulation
   * @returns The cheerio instance
   */
  getCheerio(): CheerioAPI {
    return this.$;
  }
} 