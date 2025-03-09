/**
 * ResourceContext.test.tsx
 * Tests for the ResourceContext provider and hook
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ResourceProvider, useResourceContext } from '../ResourceContext';
import { useResources } from '../../hooks/useResources';

// Mock the useResources hook
jest.mock('../../hooks/useResources', () => ({
  useResources: jest.fn()
}));

// Test component that uses the ResourceContext
const TestComponent = () => {
  const { resources, loading, error } = useResourceContext();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  
  return (
    <div>
      <div data-testid="resource-count">{resources.length}</div>
      {resources.map((resource, index) => (
        <div key={index} data-testid={`resource-${index}`}>
          {resource.title}
        </div>
      ))}
    </div>
  );
};

describe('ResourceContext', () => {
  const mockResources = [
    {
      title: 'Resource 1',
      content: 'Content 1',
      source: 'Source 1',
      url: 'https://example.com/1',
      lastUpdated: '2023-01-01T00:00:00Z'
    },
    {
      title: 'Resource 2',
      content: 'Content 2',
      source: 'Source 2',
      url: 'https://example.com/2',
      lastUpdated: '2023-01-02T00:00:00Z'
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('provides resource data to components', async () => {
    // Mock useResources to return resources
    (useResources as jest.Mock).mockReturnValue({
      resources: mockResources,
      filteredResources: mockResources,
      loading: false,
      error: null,
      searchTerm: '',
      setSearchTerm: jest.fn(),
      activeCategory: 'allResources',
      setActiveCategory: jest.fn(),
      alertResources: []
    });
    
    render(
      <ResourceProvider>
        <TestComponent />
      </ResourceProvider>
    );
    
    expect(screen.getByTestId('resource-count')).toHaveTextContent('2');
    expect(screen.getByTestId('resource-0')).toHaveTextContent('Resource 1');
    expect(screen.getByTestId('resource-1')).toHaveTextContent('Resource 2');
  });
  
  it('shows loading state', async () => {
    // Mock useResources to return loading state
    (useResources as jest.Mock).mockReturnValue({
      resources: [],
      filteredResources: [],
      loading: true,
      error: null,
      searchTerm: '',
      setSearchTerm: jest.fn(),
      activeCategory: 'allResources',
      setActiveCategory: jest.fn(),
      alertResources: []
    });
    
    render(
      <ResourceProvider>
        <TestComponent />
      </ResourceProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  
  it('shows error state', async () => {
    // Mock useResources to return error state
    (useResources as jest.Mock).mockReturnValue({
      resources: [],
      filteredResources: [],
      loading: false,
      error: 'Failed to load resources',
      searchTerm: '',
      setSearchTerm: jest.fn(),
      activeCategory: 'allResources',
      setActiveCategory: jest.fn(),
      alertResources: []
    });
    
    render(
      <ResourceProvider>
        <TestComponent />
      </ResourceProvider>
    );
    
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to load resources');
  });
  
  it('initializes with provided category', async () => {
    // Mock implementation to capture the initialCategory argument
    const mockUseResources = jest.fn().mockReturnValue({
      resources: [],
      filteredResources: [],
      loading: false,
      error: null,
      searchTerm: '',
      setSearchTerm: jest.fn(),
      activeCategory: 'travelPlanning',
      setActiveCategory: jest.fn(),
      alertResources: []
    });
    
    (useResources as jest.Mock).mockImplementation(mockUseResources);
    
    render(
      <ResourceProvider initialCategory="travelPlanning">
        <TestComponent />
      </ResourceProvider>
    );
    
    // Check that useResources was called with the initialCategory
    expect(mockUseResources).toHaveBeenCalledWith('travelPlanning');
  });
  
  it('throws error when useResourceContext is used outside provider', () => {
    // Suppress console errors for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    // Expect render to throw an error
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useResourceContext must be used within a ResourceProvider');
    
    // Restore console.error
    console.error = originalError;
  });
}); 