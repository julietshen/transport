/**
 * useResources.ts
 * Custom hook for fetching and managing resource data
 */

import { useState, useEffect, useMemo } from 'react';
import { fetchResources } from '../utils/resources/dataFetcher';
import { filterResourcesByCategory, filterResourcesBySearch } from '../utils/resources/filters';
import { ScrapedData } from '../types/resources';

/**
 * Hook for managing resource data, including fetching, filtering, and search
 * 
 * @param initialCategory - Initial category to filter by (optional)
 * @returns Object containing resource data and management functions
 */
export function useResources(initialCategory?: string) {
  const [resources, setResources] = useState<ScrapedData[]>([]);
  const [filteredResources, setFilteredResources] = useState<ScrapedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'allResources');

  // Fetch resources on component mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await fetchResources();
        setResources(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load resources. Please try again later.');
        setLoading(false);
        console.error('Error loading resources:', err);
      }
    };

    loadResources();
  }, []);

  // Apply filters when resources, search term, or category changes
  useEffect(() => {
    if (resources.length > 0) {
      // First filter by category
      const categoryFiltered = filterResourcesByCategory(resources, activeCategory);
      
      // Then filter by search term if provided
      const searchFiltered = searchTerm 
        ? filterResourcesBySearch(categoryFiltered, searchTerm)
        : categoryFiltered;
      
      setFilteredResources(searchFiltered);
    }
  }, [resources, searchTerm, activeCategory]);

  // Get alert resources - memoized to prevent recalculation
  const alertResources = useMemo(() => {
    if (!resources.length) return [];
    return filterResourcesByCategory(resources, 'currentAlerts').slice(0, 3);
  }, [resources]);

  return {
    resources,
    filteredResources,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    alertResources
  };
} 