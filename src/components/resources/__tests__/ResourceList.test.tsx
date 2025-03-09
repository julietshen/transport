/**
 * ResourceList.test.tsx
 * Tests for the ResourceList component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResourceList } from '../ResourceList';
import { useResourceContext } from '../../../context/ResourceContext';
import { useTranslation } from '../../../hooks/useTranslation';

// Mock the required hooks and components
jest.mock('../../../context/ResourceContext', () => ({
  useResourceContext: jest.fn()
}));

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: jest.fn()
}));

jest.mock('../ResourceCard', () => ({
  ResourceCard: ({ resource }: any) => (
    <div data-testid="resource-card">
      {resource.title}
    </div>
  )
}));

describe('ResourceList component', () => {
  beforeEach(() => {
    // Set up mock for translations
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key // Return the key for simple testing
    });
  });
  
  it('shows loading spinner when loading', () => {
    // Mock the resource context with loading state
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: [],
      loading: true,
      error: null,
      activeCategory: 'allResources'
    });
    
    render(<ResourceList />);
    
    // Check for spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('shows error message when there is an error', () => {
    // Mock the resource context with error state
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: [],
      loading: false,
      error: 'Failed to load resources',
      activeCategory: 'allResources'
    });
    
    render(<ResourceList />);
    
    // Check for error message
    expect(screen.getByText('Failed to load resources')).toBeInTheDocument();
  });
  
  it('shows "no resources found" message when filteredResources is empty', () => {
    // Mock the resource context with empty resources
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: [],
      loading: false,
      error: null,
      activeCategory: 'allResources'
    });
    
    render(<ResourceList />);
    
    // Check for no resources message
    expect(screen.getByText('noResourcesFound')).toBeInTheDocument();
  });
  
  it('renders resources correctly', () => {
    // Mock resources
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
    
    // Mock the resource context with resources
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: mockResources,
      loading: false,
      error: null,
      activeCategory: 'allResources'
    });
    
    render(<ResourceList />);
    
    // Check for resources
    expect(screen.getByText('Resource 1')).toBeInTheDocument();
    expect(screen.getByText('Resource 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('resource-card')).toHaveLength(2);
  });
  
  it('limits the number of resources when limit prop is provided', () => {
    // Mock resources
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
      },
      {
        title: 'Resource 3',
        content: 'Content 3',
        source: 'Source 3',
        url: 'https://example.com/3',
        lastUpdated: '2023-01-03T00:00:00Z'
      }
    ];
    
    // Mock the resource context with resources
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: mockResources,
      loading: false,
      error: null,
      activeCategory: 'allResources'
    });
    
    render(<ResourceList limit={2} />);
    
    // Check that only 2 resources are rendered
    expect(screen.getAllByTestId('resource-card')).toHaveLength(2);
    expect(screen.getByText('Resource 1')).toBeInTheDocument();
    expect(screen.getByText('Resource 2')).toBeInTheDocument();
    expect(screen.queryByText('Resource 3')).not.toBeInTheDocument();
  });
  
  it('does not show heading when showHeading is false', () => {
    // Mock the resource context
    (useResourceContext as jest.Mock).mockReturnValue({
      filteredResources: [
        {
          title: 'Resource 1',
          content: 'Content 1',
          source: 'Source 1',
          url: 'https://example.com/1',
          lastUpdated: '2023-01-01T00:00:00Z'
        }
      ],
      loading: false,
      error: null,
      activeCategory: 'allResources'
    });
    
    render(<ResourceList showHeading={false} />);
    
    // Check that the heading is not rendered
    expect(screen.queryByText('allResourcesHeading')).not.toBeInTheDocument();
  });
}); 