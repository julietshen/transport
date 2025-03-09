/**
 * ResourceDetail.tsx
 * Component for displaying detailed information about a resource
 */

import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Link, 
  Badge, 
  Flex, 
  Stack,
  useColorModeValue
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { ScrapedData } from '../../types/resources';
import { formatDate, getPriorityBadgeProps } from '../../utils/resources/formatters';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for ResourceDetail component
 */
interface ResourceDetailProps {
  resource: ScrapedData;
  isCompact?: boolean;
}

/**
 * Component for displaying detailed information about a resource
 */
export function ResourceDetail({ resource, isCompact = false }: ResourceDetailProps) {
  const { t } = useTranslation();
  
  // Get tag badge colors based on color mode
  const tagBgColor = useColorModeValue('gray.100', 'gray.700');
  const sourceBgColor = useColorModeValue('blue.50', 'blue.900');
  
  // Get priority badge props based on content
  const badgeProps = getPriorityBadgeProps(resource);
  
  return (
    <Box 
      p={isCompact ? 4 : 6} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="sm"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Header with title and badge */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Heading as="h3" size={isCompact ? "md" : "lg"} flex={1}>
          {resource.title}
        </Heading>
        
        <Badge {...badgeProps} ml={2} flexShrink={0}>
          {t(badgeProps.colorScheme)}
        </Badge>
      </Flex>
      
      {/* Source and date */}
      <Flex 
        mb={3}
        alignItems="center"
        flexWrap="wrap"
      >
        <Badge 
          bg={sourceBgColor} 
          mr={2}
          mb={1}
        >
          {resource.source}
        </Badge>
        
        <Text fontSize="sm" color="gray.500" mb={1}>
          {formatDate(resource.lastUpdated)}
        </Text>
      </Flex>
      
      {/* Content */}
      <Text mb={4} flex={1}>
        {isCompact 
          ? `${resource.content.substring(0, 150)}${resource.content.length > 150 ? '...' : ''}`
          : resource.content
        }
      </Text>
      
      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <Stack 
          direction="row" 
          mt={isCompact ? 2 : 4} 
          spacing={2} 
          wrap="wrap"
          display="flex"
        >
          {resource.tags.map(tag => (
            <Badge key={tag} bg={tagBgColor} mb={1}>
              {tag}
            </Badge>
          ))}
        </Stack>
      )}
      
      {/* Link to source */}
      <Box mt={isCompact ? 3 : 4}>
        <Link 
          href={resource.url} 
          color="brand.500"
          isExternal
          display="inline-flex"
          alignItems="center"
        >
          {t('viewSource')} <ExternalLinkIcon mx="2px" />
        </Link>
      </Box>
    </Box>
  );
} 