import { Box, Heading, Text, Link, Badge, HStack, VStack, useColorModeValue } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { ScrapedData } from '../../types/resources';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDate, getPriorityBadgeProps } from '../../utils/resources/formatters';

/**
 * Props for ResourceCard component
 */
interface ResourceCardProps {
  resource: ScrapedData;
}

/**
 * Card component for displaying a single resource
 */
export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { t } = useTranslation();
  const priorityBadge = getPriorityBadgeProps(resource);
  
  // Color mode values
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
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <VStack align="stretch" spacing={3} flex="1">
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
              t(`badges.${priorityBadge.label.toLowerCase()}`, priorityBadge.label)}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color={dateColor}>
          {t('resource.published')} {formatDate(resource.lastUpdated)}
        </Text>
        
        <Text noOfLines={3} flex="1">
          {resource.content}
        </Text>
        
        <Link 
          href={resource.url} 
          isExternal 
          color="blue.500" 
          fontWeight="medium"
          display="inline-flex"
          alignItems="center"
        >
          {t('resource.viewSource')} <ExternalLinkIcon mx="2px" />
        </Link>
      </VStack>
    </Box>
  );
}; 