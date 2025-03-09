/**
 * ResourceService.test.ts
 * Tests for the ResourceService
 */

import { ResourceService } from '../ResourceService';
import { ScrapedData } from '../../types/resources';

// Mock global fetch
global.fetch = jest.fn();

describe('ResourceService', () => {
  let service: ResourceService;
  const mockResources: ScrapedData[] = [
    {
      title: 'Resource 1',
      content: 'Content about passports',
      source: 'Source 1',
      url: 'https://example.com/1',
      lastUpdated: '2023-01-01T00:00:00Z',
      tags: ['passport', 'documentation']
    },
    {
      title: 'Resource 2',
      content: 'Content about travel alerts',
      source: 'Source 2',
      url: 'https://example.com/2',
      lastUpdated: '2023-01-02T00:00:00Z',
      tags: ['alert', 'warning'],
      primaryCategory: 'currentAlerts'
    },
    {
      title: 'Resource 3',
      content: 'Content about community support',
      source: 'Source 3',
      url: 'https://example.com/3',
      lastUpdated: '2023-01-03T00:00:00Z',
      tags: ['community', 'support'],
      primaryCategory: 'communityResources'
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResourceService();
  });
  
  describe('fetchResources', () => {
    it('fetches resources successfully', async () => {
      // Mock successful fetch
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResources
      });
      
      const result = await service.fetchResources();
      
      expect(fetch).toHaveBeenCalledWith('/scraped-data.json');
      expect(result).toEqual(mockResources);
    });
    
    it('throws error when fetch fails', async () => {
      // Mock failed fetch
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      await expect(service.fetchResources()).rejects.toThrow('Failed to fetch resources: 404 Not Found');
    });
    
    it('handles fetch exceptions', async () => {
      // Mock fetch throwing an error
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await expect(service.fetchResources()).rejects.toThrow('Network error');
    });
  });
  
  describe('filterByCategory', () => {
    it('returns all resources when category is allResources', () => {
      const result = service.filterByCategory(mockResources, 'allResources');
      expect(result).toEqual(mockResources);
    });
    
    it('filters by primaryCategory', () => {
      const result = service.filterByCategory(mockResources, 'currentAlerts');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 2');
    });
    
    it('filters by tags when primaryCategory is not set', () => {
      const result = service.filterByCategory(mockResources, 'identityDocuments');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 1');
    });
    
    it('handles resources with no tags or categories', () => {
      const resourceWithNoTagsOrCategories = {
        title: 'No Tags',
        content: 'No tags or categories',
        source: 'Source',
        url: 'https://example.com/notags',
        lastUpdated: '2023-01-04T00:00:00Z'
      };
      
      const result = service.filterByCategory([resourceWithNoTagsOrCategories], 'identityDocuments');
      expect(result).toHaveLength(0);
    });
  });
  
  describe('filterBySearch', () => {
    it('returns all resources when search term is empty', () => {
      const result = service.filterBySearch(mockResources, '');
      expect(result).toEqual(mockResources);
    });
    
    it('filters by title', () => {
      const result = service.filterBySearch(mockResources, 'Resource 1');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 1');
    });
    
    it('filters by content', () => {
      const result = service.filterBySearch(mockResources, 'passport');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 1');
    });
    
    it('filters by source', () => {
      const result = service.filterBySearch(mockResources, 'Source 3');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 3');
    });
    
    it('filters by tags', () => {
      const result = service.filterBySearch(mockResources, 'community');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 3');
    });
    
    it('is case insensitive', () => {
      const result = service.filterBySearch(mockResources, 'PASSPORT');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Resource 1');
    });
  });
  
  describe('sortByDate', () => {
    it('sorts resources by date (newest first)', () => {
      const sorted = service.sortByDate(mockResources);
      
      expect(sorted[0].title).toBe('Resource 3');
      expect(sorted[1].title).toBe('Resource 2');
      expect(sorted[2].title).toBe('Resource 1');
    });
    
    it('does not modify the original array', () => {
      const original = [...mockResources];
      service.sortByDate(mockResources);
      
      expect(mockResources).toEqual(original);
    });
  });
}); 