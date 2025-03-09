/**
 * TopicScraper.test.ts
 * Tests for the TopicScraper base class
 */

import { TopicScraper } from '../TopicScraper';
import { Topic } from '../../../types/topics';
import { ScrapedData } from '../../../types/resources';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

// Create a concrete implementation of TopicScraper for testing
class TestTopicScraper extends TopicScraper {
  constructor(topics: Topic[]) {
    super('test', 'Test Scraper', topics);
  }
  
  // Implement abstract method
  async scrape(): Promise<ScrapedData[]> {
    return [];
  }
  
  // Expose protected methods for testing
  public testFindMatchingTopics(content: string, title: string): Topic[] {
    return this.findMatchingTopics(content, title);
  }
  
  public async testSaveToContentQueue(items: ScrapedData[]): Promise<void> {
    return this.saveToContentQueue(items);
  }
}

describe('TopicScraper', () => {
  // Sample topics for testing
  const sampleTopics: Topic[] = [
    {
      id: 'passport',
      name: 'Passport Information',
      description: 'Information about passports',
      keywords: ['passport', 'travel document'],
      exclusionTerms: ['fiction', 'movie'],
      category: 'identityDocuments',
      priority: 5
    },
    {
      id: 'visa',
      name: 'Visa Information',
      description: 'Information about visas',
      keywords: ['visa', 'entry permit'],
      category: 'travelPlanning',
      priority: 4
    }
  ];
  
  let scraper: TestTopicScraper;
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    scraper = new TestTopicScraper(sampleTopics);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });
  
  describe('findMatchingTopics', () => {
    it('should find topics that match keywords in content', () => {
      const content = 'This article discusses passport requirements for international travel.';
      const title = 'Travel Guide';
      
      const matchingTopics = scraper.testFindMatchingTopics(content, title);
      
      expect(matchingTopics).toHaveLength(1);
      expect(matchingTopics[0].id).toBe('passport');
    });
    
    it('should find topics that match keywords in title', () => {
      const content = 'This is about international travel.';
      const title = 'New Visa Requirements Announced';
      
      const matchingTopics = scraper.testFindMatchingTopics(content, title);
      
      expect(matchingTopics).toHaveLength(1);
      expect(matchingTopics[0].id).toBe('visa');
    });
    
    it('should find multiple matching topics', () => {
      const content = 'Information about both passport and visa requirements for travel.';
      const title = 'Travel Documents Guide';
      
      const matchingTopics = scraper.testFindMatchingTopics(content, title);
      
      expect(matchingTopics).toHaveLength(2);
      expect(matchingTopics.map(t => t.id)).toContain('passport');
      expect(matchingTopics.map(t => t.id)).toContain('visa');
    });
    
    it('should not match topics with exclusion terms', () => {
      const content = 'This movie features a character trying to get a passport.';
      const title = 'Fiction Film Review';
      
      const matchingTopics = scraper.testFindMatchingTopics(content, title);
      
      expect(matchingTopics).toHaveLength(0);
    });
    
    it('should handle case insensitivity correctly', () => {
      const content = 'Requirements for obtaining a PASSPORT for minors.';
      const title = 'Travel Documentation';
      
      const matchingTopics = scraper.testFindMatchingTopics(content, title);
      
      expect(matchingTopics).toHaveLength(1);
      expect(matchingTopics[0].id).toBe('passport');
    });
  });
  
  describe('saveToContentQueue', () => {
    it('should create directory if it does not exist', async () => {
      // Mock path.dirname to return a directory path
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      // Mock fs.existsSync to return false for the directory
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const items: ScrapedData[] = [{
        source: 'Test Source',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: new Date().toISOString(),
        url: 'https://example.com',
        tags: ['passport']
      }];
      
      await scraper.testSaveToContentQueue(items);
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to', { recursive: true });
    });
    
    it('should read existing queue if it exists', async () => {
      // Mock path.dirname
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      // Mock fs.existsSync to return true for both directory and file
      (fs.existsSync as jest.Mock).mockImplementation((path) => true);
      // Mock fs.readFileSync to return an empty array
      (fs.readFileSync as jest.Mock).mockReturnValue('[]');
      
      const items: ScrapedData[] = [{
        source: 'Test Source',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: new Date().toISOString(),
        url: 'https://example.com',
        tags: ['passport']
      }];
      
      await scraper.testSaveToContentQueue(items);
      
      expect(fs.readFileSync).toHaveBeenCalled();
    });
    
    it('should add new items and avoid duplicates based on URL', async () => {
      // Create existing and new items with overlapping URLs
      const existingItems = [
        {
          source: 'Existing Source',
          title: 'Existing Title',
          content: 'Existing Content',
          lastUpdated: '2023-01-01T00:00:00Z',
          url: 'https://example.com/1'
        }
      ];
      
      const newItems: ScrapedData[] = [
        {
          source: 'New Source 1',
          title: 'New Title 1',
          content: 'New Content 1',
          lastUpdated: '2023-02-01T00:00:00Z',
          url: 'https://example.com/1' // Duplicate URL
        },
        {
          source: 'New Source 2',
          title: 'New Title 2',
          content: 'New Content 2',
          lastUpdated: '2023-02-01T00:00:00Z',
          url: 'https://example.com/2' // New URL
        }
      ];
      
      // Mock path.dirname
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      // Mock fs.existsSync to return true
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.readFileSync to return existing items
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(existingItems));
      
      await scraper.testSaveToContentQueue(newItems);
      
      // Check that writeFileSync was called with the expected combined array
      // This should include the existing item and the new item with a unique URL
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      expect(writtenData).toHaveLength(2);
      expect(writtenData[0].url).toBe('https://example.com/1');
      expect(writtenData[0].source).toBe('Existing Source'); // Should keep the existing item
      expect(writtenData[1].url).toBe('https://example.com/2');
    });
    
    it('should handle errors gracefully', async () => {
      const error = new Error('File system error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fs.existsSync to throw an error
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      const items: ScrapedData[] = [{
        source: 'Test Source',
        title: 'Test Title',
        content: 'Test Content',
        lastUpdated: new Date().toISOString(),
        url: 'https://example.com',
        tags: ['passport']
      }];
      
      await scraper.testSaveToContentQueue(items);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
}); 