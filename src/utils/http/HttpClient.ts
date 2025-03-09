/**
 * HttpClient.ts
 * A wrapper around axios for making HTTP requests with consistent error handling and configuration
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpClient {
  private client: AxiosInstance;
  
  /**
   * Creates a new HttpClient instance with default configuration
   * @param config Optional AxiosRequestConfig to override defaults
   */
  constructor(config?: AxiosRequestConfig) {
    // Default configuration for all HTTP requests
    const defaultConfig: AxiosRequestConfig = {
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
    
    // Merge configurations, with provided config taking precedence
    this.client = axios.create({
      ...defaultConfig,
      ...config
    });
  }
  
  /**
   * Makes a GET request to the specified URL
   * @param url The URL to request
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `GET ${url}`);
      throw error;
    }
  }
  
  /**
   * Makes a POST request to the specified URL
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional request configuration
   * @returns Promise resolving to the response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, `POST ${url}`);
      throw error;
    }
  }
  
  /**
   * Handles errors from HTTP requests with consistent logging
   * @param error The error that occurred
   * @param context Additional context for the error
   */
  private handleError(error: any, context: string): void {
    if (axios.isAxiosError(error)) {
      console.error(`HTTP Error in ${context}:`, error.message);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Response: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      } else if (error.request) {
        console.error('No response received');
      }
    } else {
      console.error(`Non-HTTP Error in ${context}:`, error);
    }
  }
} 