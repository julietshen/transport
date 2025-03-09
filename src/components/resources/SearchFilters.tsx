import { Box, Input, InputGroup, InputLeftElement, InputRightElement, Button, Select, HStack, VStack, Text } from '@chakra-ui/react';
import { useState, KeyboardEvent } from 'react';
import { useTranslation } from '../../translations/useTranslation';

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
  // Local state for the input value, initialized with current searchTerm
  const [inputValue, setInputValue] = useState(searchTerm);
  const { t } = useTranslation();

  // Handler for search button click
  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  // Handler for Enter key press
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <VStack spacing={4} align="stretch" mb={6}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          🔍
        </InputLeftElement>
        <Input
          placeholder={t('search.placeholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="filled"
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleSearch}>
            {t('search.button')}
          </Button>
        </InputRightElement>
      </InputGroup>
      
      {searchTerm && (
        <Text fontSize="sm" color="gray.500">
          {t('search.resultsFor', { term: searchTerm })}
        </Text>
      )}
      
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