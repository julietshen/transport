/**
 * ResourceCategories.tsx
 * Component for displaying and selecting resource categories
 */

import React from 'react';
import { Tabs, TabList, Tab, useColorModeValue } from '@chakra-ui/react';
import { useResourceContext } from '../../context/ResourceContext';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for ResourceCategories component
 */
interface ResourceCategoriesProps {
  variant?: 'solid' | 'outline' | 'enclosed' | 'soft-rounded' | 'line';
  colorScheme?: string;
}

/**
 * Component for displaying and selecting resource categories
 */
export function ResourceCategories({ 
  variant = 'line', 
  colorScheme = 'brand' 
}: ResourceCategoriesProps) {
  const { activeCategory, setActiveCategory } = useResourceContext();
  const { t } = useTranslation();
  
  // Define the categories to display
  const categories = [
    { id: 'currentAlerts', label: 'currentAlertsTab' },
    { id: 'travelPlanning', label: 'travelPlanningTab' },
    { id: 'identityDocuments', label: 'identityDocumentsTab' },
    { id: 'communityResources', label: 'communityResourcesTab' },
    { id: 'allResources', label: 'allResourcesTab' }
  ];
  
  // Get the index of the active category
  const activeIndex = categories.findIndex(cat => cat.id === activeCategory);
  
  // Function to handle tab change
  const handleTabChange = (index: number) => {
    setActiveCategory(categories[index].id);
  };
  
  // Get colors based on color mode
  const tabHoverBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const activeTabBg = useColorModeValue(`${colorScheme}.100`, `${colorScheme}.800`);
  
  return (
    <Tabs 
      variant={variant}
      colorScheme={colorScheme}
      index={activeIndex}
      onChange={handleTabChange}
      isLazy
    >
      <TabList 
        overflowX="auto" 
        overflowY="hidden" 
        css={{
          // Style scrollbar for better UX
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        {categories.map(category => (
          <Tab 
            key={category.id}
            _hover={{ bg: tabHoverBg }}
            _selected={{ bg: activeTabBg, fontWeight: 'semibold' }}
            flexShrink={0}
            whiteSpace="nowrap"
          >
            {t(category.label)}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
} 