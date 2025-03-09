import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

/**
 * Loading spinner component with message
 */
export const LoadingSpinner: React.FC = () => {
  return (
    <Flex justify="center" py={12}>
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text>Loading travel information...</Text>
      </VStack>
    </Flex>
  );
}; 