/**
 * HtmlParser.test.ts
 * Tests for the HtmlParser utility
 */

import { HtmlParser } from '../HtmlParser';

describe('HtmlParser', () => {
  // Sample HTML for testing
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
        <meta name="description" content="Test description" />
        <meta property="article:published_time" content="2023-03-15T12:00:00Z" />
      </head>
      <body>
        <h1 class="page-title">Page Title</h1>
        <div class="article">
          <div class="article-content">This is the main content of the article.</div>
          <span class="article-date">March 15, 2023</span>
        </div>
        <div class="links">
          <a href="/relative-link">Relative Link</a>
          <a href="https://example.com/absolute-link">Absolute Link</a>
          <a href="https://other-domain.com/external">External Link</a>
        </div>
        <div id="complex-content">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </div>
      </body>
    </html>
  `;

  let parser: HtmlParser;

  beforeEach(() => {
    parser = new HtmlParser(sampleHtml);
  });

  describe('findText', () => {
    it('should find text by first matching selector', () => {
      const result = parser.findText(['h1', '.article-content']);
      expect(result).toBe('Page Title');
    });

    it('should try all selectors until finding a match', () => {
      const result = parser.findText(['.non-existent', 'h1.page-title']);
      expect(result).toBe('Page Title');
    });

    it('should return fallback value if no selector matches', () => {
      const result = parser.findText(['.non-existent'], 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return empty string if no selector matches and no fallback provided', () => {
      const result = parser.findText(['.non-existent']);
      expect(result).toBe('');
    });
  });

  describe('findAttribute', () => {
    it('should find attribute from first matching selector', () => {
      const result = parser.findAttribute(['meta[name="description"]'], 'content');
      expect(result).toBe('Test description');
    });

    it('should return fallback when attribute not found', () => {
      const result = parser.findAttribute(['meta[name="keywords"]'], 'content', 'Fallback');
      expect(result).toBe('Fallback');
    });
  });

  describe('extractLinks', () => {
    it('should extract all links from given selectors', () => {
      const links = parser.extractLinks(['.links a'], 'https://example.com');
      expect(links).toHaveLength(3);
      expect(links).toContain('https://example.com/relative-link');
      expect(links).toContain('https://example.com/absolute-link');
      // External link should be excluded since it's not from the same domain
      expect(links).not.toContain('https://other-domain.com/external');
    });

    it('should return empty array when no links are found', () => {
      const links = parser.extractLinks(['.non-existent a'], 'https://example.com');
      expect(links).toEqual([]);
    });
  });

  describe('extractMainContent', () => {
    it('should extract content from first matching selector with sufficient length', () => {
      const content = parser.extractMainContent(['.article-content'], 10);
      expect(content).toBe('This is the main content of the article.');
    });

    it('should try multiple selectors until finding one with sufficient length', () => {
      const content = parser.extractMainContent(['.non-existent', '.article-content'], 10);
      expect(content).toBe('This is the main content of the article.');
    });

    it('should return empty string if no content with sufficient length is found', () => {
      const content = parser.extractMainContent(['.article-date'], 50);
      expect(content).toBe('');
    });
  });

  describe('findDate', () => {
    it('should find and parse date from meta tag', () => {
      const date = parser.findDate(['meta[property="article:published_time"]']);
      expect(date).toEqual(new Date('2023-03-15T12:00:00Z'));
    });

    it('should return current date if no date selectors match', () => {
      // Mock current date for testing
      const realDate = Date;
      const mockDate = new Date('2023-04-01T00:00:00Z');
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
      } as any;

      const date = parser.findDate(['.non-existent']);
      
      // Restore original Date
      global.Date = realDate;
      
      expect(date).toEqual(mockDate);
    });
  });

  describe('getCheerio', () => {
    it('should return the cheerio instance for direct manipulation', () => {
      const $ = parser.getCheerio();
      expect($('title').text()).toBe('Test Page');
    });
  });
}); 