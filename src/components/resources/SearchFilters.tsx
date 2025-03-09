import { Box, Input, InputGroup, InputLeftElement, Select, HStack, VStack } from '@chakra-ui/react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  resourceType: string;
  setResourceType: (type: string) => void;
  sourceOptions: { value: string; label: string }[];
  resourceTypeOptions: { value: string; label: string }[];
}

/**
 * Search and filters component for resources
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedSource,
  setSelectedSource,
  resourceType,
  setResourceType,
  sourceOptions,
  resourceTypeOptions
}) => {
  return (
    <VStack spacing={4} align="stretch" mb={6}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          🔍
        </InputLeftElement>
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="filled"
        />
      </InputGroup>
      
      <HStack>
        <Box flex="1">
          <Select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            variant="filled"
          >
            {sourceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>
        
        <Box flex="1">
          <Select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            variant="filled"
          >
            {resourceTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>
      </HStack>
    </VStack>
  );
}; 