import { Box, Container, Text, Button, Link, useColorModeValue, Flex, Icon } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { useTranslation } from '../../translations/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const bg = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Box as="footer" bg={bg} py={8} mt={12}>
      <Container maxW="container.xl">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'center', md: 'flex-start' }}>
          <Box maxW={{ base: 'full', md: '70%' }} mb={{ base: 6, md: 0 }}>
            <Text fontSize="sm" color={textColor} mb={3}>
              Not legal advice. Just collected info that might change. Check with LGBTQ+ orgs if planning travel.
            </Text>
            <Text fontSize="sm" color={textColor}>
              Made by an ally. Open source. Contributions welcome.
            </Text>
          </Box>

          <Link href="https://github.com/yourusername/transport" isExternal>
            <Button
              leftIcon={<Icon as={FaGithub} />}
              colorScheme="gray"
              variant="outline"
              size="md"
            >
              Source Code
            </Button>
          </Link>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer; 