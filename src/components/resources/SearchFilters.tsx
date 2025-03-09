import { Box, Input, InputGroup, InputLeftElement, InputRightElement, Button, Select, HStack, VStack, Text } from '@chakra-ui/react';
import { useState, KeyboardEvent } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useResourceContext } from '../../context/ResourceContext';

/**
 * Props for SearchFilters component
 */
interface SearchFiltersProps {
  sourceOptions: { value: string; label: string }[];
  resourceTypeOptions: { value: string; label: string }[];
}

/**
 * Search and filters component for resources
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  sourceOptions,
  resourceTypeOptions
}) => {
  // Get state from ResourceContext
  const { searchTerm, setSearchTerm, activeCategory, setActiveCategory } = useResourceContext();
  
  // Local state for the input value, initialized with current searchTerm
  const [inputValue, setInputValue] = useState(searchTerm);
  
  // Use translation hook
  const { t } = useTranslation();

  // Handler for search button click
  const handleSearch = () => {
    setSearchTerm(inputValue);
    
    // Switch to All Resources when searching
    if (inputValue.trim() !== '' && activeCategory !== 'allResources') {
      setActiveCategory('allResources');
    }
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
            value="all"
            onChange={(e) => console.log('Source filter not implemented in new architecture')}
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
            value="all"
            onChange={(e) => console.log('Resource type filter not implemented in new architecture')}
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