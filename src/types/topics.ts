/**
 * Topic type definitions for the topic-based scraper
 */

/**
 * Represents a topic of interest for scraping
 */
export interface Topic {
  /**
   * Unique identifier for the topic
   */
  id: string;

  /**
   * Human-readable name of the topic
   */
  name: string;
  
  /**
   * Description of the topic
   */
  description: string;
  
  /**
   * Keywords that indicate content is related to this topic
   * Used for matching algorithms in scrapers
   */
  keywords: string[];
  
  /**
   * Terms that should exclude content even if keywords match
   * Used to reduce false positives
   */
  exclusionTerms?: string[];
  
  /**
   * The category this topic should be assigned to
   */
  category: string;
  
  /**
   * Priority level for sorting (higher values = higher priority)
   */
  priority: number;
}

/**
 * Topics collection
 */
export interface TopicsConfig {
  topics: Topic[];
  lastUpdated: string;
} 