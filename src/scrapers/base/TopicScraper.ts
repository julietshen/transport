/**
 * TopicScraper.ts
 * Base class for topic-based scrapers that extends BaseScraper with topic-specific functionality
 */

import { BaseScraper } from './BaseScraper';
import { ScrapedData } from '../../types/resources';
import { Topic } from '../../types/topics';

export abstract class TopicScraper extends BaseScraper {
  protected topics: Topic[];
  private contentQueuePath: string;

  constructor(sourceId: string, sourceName: string, topics: Topic[], contentQueuePath: string = 'public/content-queue.json') {
    super(sourceId, sourceName);
    this.topics = topics;
    this.contentQueuePath = contentQueuePath;
  }

  /**
   * Analyzes scraped content to determine if it matches any topics of interest
   * @param content The content to analyze
   * @param title The title of the content
   * @returns Array of matching topics
   */
  protected findMatchingTopics(content: string, title: string): Topic[] {
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    
    return this.topics.filter(topic => {
      // Check if any keywords match in title or content
      const keywordMatch = topic.keywords.some(keyword => 
        lowerTitle.includes(keyword.toLowerCase()) || 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      // Check if any exclusion terms match
      const exclusionMatch = topic.exclusionTerms?.some(term => 
        lowerTitle.includes(term.toLowerCase()) || 
        lowerContent.includes(term.toLowerCase())
      ) || false;
      
      // Return true if keywords match and no exclusion terms match
      return keywordMatch && !exclusionMatch;
    });
  }

  /**
   * Saves scraped items to the content queue file
   * @param items Scraped items to save
   */
  protected async saveToContentQueue(items: ScrapedData[]): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Ensure the directory exists
      const dir = path.dirname(this.contentQueuePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Read existing queue if it exists
      let existingQueue: ScrapedData[] = [];
      if (fs.existsSync(this.contentQueuePath)) {
        const queueContent = fs.readFileSync(this.contentQueuePath, 'utf8');
        existingQueue = JSON.parse(queueContent);
      }
      
      // Add new items, avoiding duplicates based on URL
      const newQueue = [...existingQueue];
      
      for (const item of items) {
        if (!newQueue.some(existingItem => existingItem.url === item.url)) {
          newQueue.push(item);
        }
      }
      
      // Save updated queue
      fs.writeFileSync(this.contentQueuePath, JSON.stringify(newQueue, null, 2));
      console.log(`Saved ${items.length} new items to content queue`);
    } catch (error) {
      this.handleError(error, 'saveToContentQueue');
    }
  }
} 