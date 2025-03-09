/**
 * ResourceContext.tsx
 * Provides global access to resource data and related state
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useResources } from '../hooks/useResources';
import { ScrapedData } from '../types/resources';

/**
 * Interface for the ResourceContext value
 */
interface ResourceContextValue {
  resources: ScrapedData[];
  filteredResources: ScrapedData[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  alertResources: ScrapedData[];
}

// Create context with default values
const ResourceContext = createContext<ResourceContextValue>({
  resources: [],
  filteredResources: [],
  loading: false,
  error: null,
  searchTerm: '',
  setSearchTerm: () => {},
  activeCategory: 'allResources',
  setActiveCategory: () => {},
  alertResources: []
});

/**
 * Props for ResourceProvider component
 */
interface ResourceProviderProps {
  children: ReactNode;
  initialCategory?: string;
}

/**
 * Provider component that makes resource data available to any child component
 */
export function ResourceProvider({ children, initialCategory }: ResourceProviderProps) {
  const resourceData = useResources(initialCategory);
  
  return (
    <ResourceContext.Provider value={resourceData}>
      {children}
    </ResourceContext.Provider>
  );
}

/**
 * Hook for accessing resource data from the context
 */
export function useResourceContext(): ResourceContextValue {
  const context = useContext(ResourceContext);
  
  if (context === undefined) {
    throw new Error('useResourceContext must be used within a ResourceProvider');
  }
  
  return context;
} 