import { Flex, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../../translations/useTranslation';

interface HeaderProps {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

/**
 * Site header component with title and theme toggle
 */
export const Header: React.FC<HeaderProps> = ({ colorMode, toggleColorMode }) => {
  const { t } = useTranslation();
  
  return (
    <Flex justify="space-between" align="center" mb={8}>
      <VStack spacing={1} align="flex-start">
        <Heading 
          as="h1" 
          size="2xl" 
          fontWeight="bold" 
          fontFamily="'Helvetica Neue', sans-serif"
          bgGradient={colorMode === 'light' 
            ? "linear(to-r, #1a5293, #c41d69, #ffffff, #c41d69, #1a5293)" 
            : "linear(to-r, #55b9ff, #ff77b1, #ffffff, #ff77b1, #55b9ff)"}
          bgClip="text"
          letterSpacing="1.5px"
          textShadow={colorMode === 'light' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.6), 0px 0px 15px rgba(0, 0, 0, 0.2)' 
            : '0px 0px 10px rgba(255, 255, 255, 0.3)'}
          sx={{
            WebkitTextStroke: colorMode === 'light' ? '1.5px rgba(0, 0, 0, 0.5)' : '1px rgba(255, 255, 255, 0.15)',
            transform: 'scale(1.02)',
            paddingBottom: '2px'
          }}
        >
          {t('general.siteTitle')}
        </Heading>
        <Text fontSize="md" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
          {t('general.siteDescription')}
        </Text>
      </VStack>
      <HStack spacing={4}>
        <LanguageSwitcher />
        <Button onClick={toggleColorMode} aria-label="Toggle color mode">
          {colorMode === 'light' ? t('header.darkMode') : t('header.lightMode')}
        </Button>
      </HStack>
    </Flex>
  );
}; 