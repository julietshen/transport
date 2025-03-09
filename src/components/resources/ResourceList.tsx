/**
 * ResourceList.tsx
 * Component for displaying a list of resources
 */

import React from 'react';
import { Box, SimpleGrid, Text, Center, Spinner } from '@chakra-ui/react';
import { ResourceCard } from './ResourceCard';
import { useResourceContext } from '../../context/ResourceContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ErrorAlert } from '../layout/ErrorAlert';

/**
 * Props for ResourceList component
 */
interface ResourceListProps {
  showHeading?: boolean;
  limit?: number;
}

/**
 * Component for displaying a grid of resource cards
 */
export function ResourceList({ showHeading = true, limit }: ResourceListProps) {
  const { filteredResources, loading, error, activeCategory } = useResourceContext();
  const { t } = useTranslation();
  
  // If loading, show spinner
  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }
  
  // If error, show error alert
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  // If no resources found, show message
  if (filteredResources.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg">{t('noResourcesFound')}</Text>
      </Box>
    );
  }
  
  // Limit the number of resources if specified
  const resources = limit ? filteredResources.slice(0, limit) : filteredResources;
  
  return (
    <Box mt={4}>
      {showHeading && (
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          {t(`${activeCategory}Heading`)}
        </Text>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {resources.map((resource) => (
          <ResourceCard key={`${resource.source}-${resource.url}`} resource={resource} />
        ))}
      </SimpleGrid>
    </Box>
  );
} 