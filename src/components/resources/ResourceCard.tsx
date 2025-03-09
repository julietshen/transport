import { Box, Heading, Text, Link, Badge, HStack, VStack, useColorModeValue } from '@chakra-ui/react';
import { ScrapedData } from '../../types/resources';
import { useTranslation } from '../../translations/useTranslation';

interface ResourceCardProps {
  resource: ScrapedData;
  colorMode: 'light' | 'dark';
  formatDate: (date: string) => string;
  getPriorityBadgeProps: (item: ScrapedData) => { colorScheme: string; label: string };
  getResourceTypeWithYear: (item: ScrapedData) => string;
}

/**
 * Card component for displaying a single resource
 */
export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  colorMode,
  formatDate,
  getPriorityBadgeProps,
  getResourceTypeWithYear
}) => {
  const { t } = useTranslation();
  const priorityBadge = getPriorityBadgeProps(resource);
  const cardBg = useColorModeValue('white', 'gray.800');
  const dateColor = useColorModeValue('gray.600', 'gray.400');
  
  // Get translation key for the source
  const sourceKey = `sources.${resource.source.toLowerCase().replace(/\s+/g, '')}`;
  
  // Try to translate the source, but check if result is just the key (which means translation failed)
  let translatedSource = t(sourceKey);
  if (translatedSource === sourceKey) {
    // If translation failed, use the original source name
    translatedSource = resource.source;
  }
    
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <VStack align="stretch" spacing={3}>
        <Heading size="md">{resource.title}</Heading>
        
        <HStack wrap="wrap" spacing={2}>
          <Badge 
            variant="solid" 
            colorScheme="blue" 
            fontSize="xs"
            textTransform="uppercase"
            py={1}
            px={2}
            minWidth="80px"
            textAlign="center"
          >
            {translatedSource}
          </Badge>
          
          <Badge 
            variant="subtle" 
            colorScheme={priorityBadge.colorScheme} 
            fontSize="xs"
            textTransform="uppercase"
            py={1}
            px={2}
            minWidth="80px"
            textAlign="center"
          >
            {priorityBadge.label && priorityBadge.label.startsWith('badges.') ? 
              t(priorityBadge.label) : 
              t(`badges.${priorityBadge.label.toLowerCase()}`, { fallback: priorityBadge.label })}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color={dateColor}>
          {t('resource.published')} {formatDate(resource.lastUpdated)}
        </Text>
        
        <Text noOfLines={3}>
          {resource.content}
        </Text>
        
        <Link 
          href={resource.url} 
          isExternal 
          color="blue.500" 
          fontWeight="medium"
        >
          {t('resource.viewSource')}
        </Link>
      </VStack>
    </Box>
  );
}; 