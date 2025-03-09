/**
 * FileSystem.ts
 * A utility class for file system operations used in the scraper
 */

import * as fs from 'fs';
import * as path from 'path';

export class FileSystem {
  /**
   * Ensures that a directory exists, creating it if necessary
   * @param directory The directory path to ensure exists
   */
  static ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  
  /**
   * Reads JSON data from a file
   * @param filePath The path to the JSON file
   * @param defaultValue Default value to return if the file doesn't exist
   * @returns The parsed JSON data or the default value
   */
  static readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent) as T;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Writes data to a JSON file
   * @param filePath The path to the JSON file
   * @param data The data to write
   * @param pretty Whether to format the JSON with indentation
   */
  static writeJsonFile(filePath: string, data: any, pretty: boolean = true): void {
    try {
      // Ensure the directory exists
      const directory = path.dirname(filePath);
      this.ensureDirectoryExists(directory);
      
      // Write the file
      const jsonString = pretty 
        ? JSON.stringify(data, null, 2) 
        : JSON.stringify(data);
      
      fs.writeFileSync(filePath, jsonString);
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Appends data to an existing JSON array file or creates a new one
   * @param filePath The path to the JSON file
   * @param newData Array of new items to append
   * @param uniqueKey Property to use for checking duplicates
   */
  static appendToJsonArrayFile<T>(filePath: string, newData: T[], uniqueKey: keyof T): void {
    try {
      // Read existing data
      const existingData = this.readJsonFile<T[]>(filePath, []);
      
      // Add new items, avoiding duplicates
      const combined = [...existingData];
      
      for (const item of newData) {
        if (!combined.some(existing => existing[uniqueKey] === item[uniqueKey])) {
          combined.push(item);
        }
      }
      
      // Write updated data
      this.writeJsonFile(filePath, combined);
      
      console.log(`Appended ${newData.length} new items to ${filePath}`);
    } catch (error) {
      console.error(`Error appending to JSON file ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Creates a backup of a file before modifying it
   * @param filePath The path to the file to backup
   */
  static createBackup(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`Created backup at ${backupPath}`);
      }
    } catch (error) {
      console.error(`Error creating backup of ${filePath}:`, error);
      // Continue without backup
    }
  }
} 