/**
 * FileSystem.test.ts
 * Tests for the FileSystem utility
 */

import { FileSystem } from '../FileSystem';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('FileSystem', () => {
  // Mock console.error and console.log
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
  
  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      // Mock fs.existsSync to return false (directory doesn't exist)
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      FileSystem.ensureDirectoryExists('/path/to/dir');
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/dir');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
    });
    
    it('should not create directory if it already exists', () => {
      // Mock fs.existsSync to return true (directory exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      FileSystem.ensureDirectoryExists('/path/to/dir');
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/dir');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });
  
  describe('readJsonFile', () => {
    it('should read and parse JSON file if it exists', () => {
      const fileContent = '{"key":"value"}';
      const parsedContent = { key: 'value' };
      const defaultValue = { default: true };
      
      // Mock fs.existsSync to return true (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.readFileSync to return file content
      (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
      
      const result = FileSystem.readJsonFile('/path/to/file.json', defaultValue);
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/file.json', 'utf8');
      expect(result).toEqual(parsedContent);
    });
    
    it('should return default value if file does not exist', () => {
      const defaultValue = { default: true };
      
      // Mock fs.existsSync to return false (file doesn't exist)
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const result = FileSystem.readJsonFile('/path/to/file.json', defaultValue);
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(result).toEqual(defaultValue);
    });
    
    it('should handle errors and return default value', () => {
      const error = new Error('Read error');
      const defaultValue = { default: true };
      
      // Mock fs.existsSync to return true (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.readFileSync to throw error
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      const result = FileSystem.readJsonFile('/path/to/file.json', defaultValue);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual(defaultValue);
    });
  });
  
  describe('writeJsonFile', () => {
    it('should write JSON data to file with pretty formatting', () => {
      const data = { key: 'value' };
      const jsonString = JSON.stringify(data, null, 2);
      
      // Mock path.dirname to return directory path
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      
      FileSystem.writeJsonFile('/path/to/file.json', data);
      
      expect(path.dirname).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/file.json', jsonString);
    });
    
    it('should write JSON data without pretty formatting when specified', () => {
      const data = { key: 'value' };
      const jsonString = JSON.stringify(data);
      
      // Mock path.dirname to return directory path
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      
      FileSystem.writeJsonFile('/path/to/file.json', data, false);
      
      expect(fs.writeFileSync).toHaveBeenCalledWith('/path/to/file.json', jsonString);
    });
    
    it('should handle errors and rethrow them', () => {
      const data = { key: 'value' };
      const error = new Error('Write error');
      
      // Mock path.dirname to return directory path
      (path.dirname as jest.Mock).mockReturnValue('/path/to');
      // Mock fs.writeFileSync to throw error
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      expect(() => FileSystem.writeJsonFile('/path/to/file.json', data)).toThrow(error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
  
  describe('appendToJsonArrayFile', () => {
    it('should append new items to existing array avoiding duplicates', () => {
      const existingData = [
        { id: 1, name: 'Existing 1' },
        { id: 2, name: 'Existing 2' }
      ];
      
      const newData = [
        { id: 2, name: 'Updated 2' }, // Duplicate id
        { id: 3, name: 'New 3' }
      ];
      
      const expectedCombined = [
        { id: 1, name: 'Existing 1' },
        { id: 2, name: 'Existing 2' },
        { id: 3, name: 'New 3' }
      ];
      
      // Mock FileSystem.readJsonFile to return existing data
      jest.spyOn(FileSystem, 'readJsonFile').mockReturnValue(existingData);
      // Mock FileSystem.writeJsonFile
      jest.spyOn(FileSystem, 'writeJsonFile').mockImplementation();
      
      FileSystem.appendToJsonArrayFile('/path/to/file.json', newData, 'id');
      
      expect(FileSystem.readJsonFile).toHaveBeenCalledWith('/path/to/file.json', []);
      expect(FileSystem.writeJsonFile).toHaveBeenCalledWith('/path/to/file.json', expectedCombined);
      expect(consoleLogSpy).toHaveBeenCalled();
    });
    
    it('should handle errors and rethrow them', () => {
      const newData = [{ id: 1, name: 'Item 1' }];
      const error = new Error('Read error');
      
      // Mock FileSystem.readJsonFile to throw error
      jest.spyOn(FileSystem, 'readJsonFile').mockImplementation(() => {
        throw error;
      });
      
      expect(() => FileSystem.appendToJsonArrayFile('/path/to/file.json', newData, 'id')).toThrow(error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
  
  describe('createBackup', () => {
    it('should create a backup if the file exists', () => {
      // Mock Date.now to return a fixed timestamp
      const timestamp = 1234567890;
      jest.spyOn(Date, 'now').mockReturnValue(timestamp);
      
      // Mock fs.existsSync to return true (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      FileSystem.createBackup('/path/to/file.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        '/path/to/file.json',
        '/path/to/file.json.backup.1234567890'
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });
    
    it('should not create a backup if the file does not exist', () => {
      // Mock fs.existsSync to return false (file doesn't exist)
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      FileSystem.createBackup('/path/to/file.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });
    
    it('should handle errors and continue without backup', () => {
      const error = new Error('Copy error');
      
      // Mock fs.existsSync to return true (file exists)
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.copyFileSync to throw error
      (fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      // Should not throw
      FileSystem.createBackup('/path/to/file.json');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
}); 