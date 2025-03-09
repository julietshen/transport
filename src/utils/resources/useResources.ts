import { useState, useEffect } from 'react';
import { ScrapedData } from '../../types/resources';
import { fetchResourceData } from './dataFetcher';
import { sortByPriorityAndDate } from './filters';

interface UseResourcesReturn {
  data: ScrapedData[];
  filteredData: ScrapedData[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  resourceType: string;
  setResourceType: (type: string) => void;
}

/**
 * Custom hook for fetching, filtering, and searching resource data
 * @returns Object with resource data and state management functions
 */
export const useResources = (): UseResourcesReturn => {
  const [data, setData] = useState<ScrapedData[]>([]);
  const [filteredData, setFilteredData] = useState<ScrapedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [resourceType, setResourceType] = useState('all');

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedData = await fetchResourceData();
        // Sort data by priority and date
        const sortedData = [...fetchedData].sort(sortByPriorityAndDate);
        
        setData(sortedData);
        setFilteredData(sortedData);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (data.length === 0) return;

    let filtered = [...data];

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => 
        item.source.toLowerCase() === selectedSource.toLowerCase());
    }

    // Filter by resource type
    if (resourceType !== 'all') {
      // Implementation depends on how resource types are defined
      // This is a simplified version
      if (resourceType === 'documentation') {
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes('passport') || 
          item.title.toLowerCase().includes('id') ||
          item.title.toLowerCase().includes('document'));
      } else if (resourceType === 'safety') {
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes('safety') || 
          item.title.toLowerCase().includes('advisory') ||
          item.title.toLowerCase().includes('alert'));
      }
      // Add more resource type filters as needed
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.content.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term))));
    }

    setFilteredData(filtered);
  }, [data, searchTerm, selectedSource, resourceType]);

  return {
    data,
    filteredData,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    resourceType,
    setResourceType
  };
}; 