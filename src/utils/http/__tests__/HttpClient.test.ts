/**
 * HttpClient.test.ts
 * Tests for the HttpClient utility
 */

import { HttpClient } from '../HttpClient';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock axios for tests
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    isAxiosError: jest.fn()
  };
  return mockAxios;
});

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxios: jest.Mocked<typeof axios>;
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    mockAxios = axios as jest.Mocked<typeof axios>;
    httpClient = new HttpClient();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });
  
  describe('get', () => {
    it('should make a GET request and return data', async () => {
      const mockData = { key: 'value' };
      const mockResponse = { data: mockData };
      
      mockAxios.get.mockResolvedValue(mockResponse);
      
      const result = await httpClient.get('https://example.com');
      
      expect(mockAxios.get).toHaveBeenCalledWith('https://example.com', undefined);
      expect(result).toEqual(mockData);
    });
    
    it('should handle errors in GET requests', async () => {
      const mockError = new Error('Network error');
      mockAxios.get.mockRejectedValue(mockError);
      mockAxios.isAxiosError.mockReturnValue(false);
      
      await expect(httpClient.get('https://example.com')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    it('should handle Axios specific errors', async () => {
      const mockAxiosError = {
        message: 'Request failed',
        response: {
          status: 404,
          data: { error: 'Not found' }
        }
      };
      
      mockAxios.get.mockRejectedValue(mockAxiosError);
      mockAxios.isAxiosError.mockReturnValue(true);
      
      await expect(httpClient.get('https://example.com')).rejects.toEqual(mockAxiosError);
      expect(consoleSpy).toHaveBeenCalledTimes(2); // Error message + status
    });
  });
  
  describe('post', () => {
    it('should make a POST request with data and return response data', async () => {
      const requestData = { name: 'test' };
      const mockData = { id: 1, name: 'test' };
      const mockResponse = { data: mockData };
      
      mockAxios.post.mockResolvedValue(mockResponse);
      
      const result = await httpClient.post('https://example.com', requestData);
      
      expect(mockAxios.post).toHaveBeenCalledWith('https://example.com', requestData, undefined);
      expect(result).toEqual(mockData);
    });
    
    it('should handle errors in POST requests', async () => {
      const requestData = { name: 'test' };
      const mockError = new Error('Server error');
      
      mockAxios.post.mockRejectedValue(mockError);
      mockAxios.isAxiosError.mockReturnValue(false);
      
      await expect(httpClient.post('https://example.com', requestData)).rejects.toThrow('Server error');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
}); 