import { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Text,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  Heading,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

// Import components
import {
  Header,
  LoadingSpinner,
  ErrorAlert,
  SearchFilters,
  ResourceCard,
  ResourceList,
  ResourceCategories,
  Footer
} from '../components';

// Import types
import { ScrapedData } from '../types/resources';

// Import resource utilities
import { 
  formatDate, 
  getPriorityBadgeProps, 
  getResourceTypeWithYear
} from '../utils/resources';

// Import hooks
import { useResourceContext } from '../context/ResourceContext';
import { useTranslation } from '../hooks/useTranslation';

// Import static alerts
import staticAlerts from '../data/staticAlerts';

// Source options for filtering
const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'state-dept', label: 'U.S. Department of State' },
  { value: 'garden-state', label: 'Garden State Equality' },
  { value: 'lambda-legal', label: 'Lambda Legal' },
  { value: 'advocate', label: 'The Advocate' },
  { value: 'erin-morning', label: 'Erin In The Morning' },
];

// Resource type options for filtering
const resourceTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'alert', label: 'Alerts' },
  { value: 'info', label: 'Information' },
  { value: 'guide', label: 'Guides' },
  { value: 'legal', label: 'Legal Resources' },
];

export default function Home() {
  // Use translation
  const { t } = useTranslation();
  
  // Use resource context
  const { 
    filteredResources, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    alertResources 
  } = useResourceContext();

  // State for tracking the active tab index
  const [tabIndex, setTabIndex] = useState(0);

  // Get color mode
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Head>
        <title>{t('general.siteTitle')}</title>
        <meta name="description" content={t('general.siteDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box 
        minH="100vh" 
        bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
        display="flex"
        flexDirection="column"
      >
        <Container maxW="container.xl" py={8} flex="1">
          {/* Header */}
          <Header colorMode={colorMode} toggleColorMode={toggleColorMode} />

          {/* Loading, Error, or Content */}
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} />
          ) : (
            <>
              {/* Main content */}
              <Box as="main" mt={8}>
                <Container maxW="container.xl">
                  {/* Search and filter controls */}
                  <SearchFilters 
                    sourceOptions={sourceOptions}
                    resourceTypeOptions={resourceTypeOptions}
                  />
                  
                  {/* Display current alerts at the top */}
                  {alertResources.length > 0 && (
                    <Box mb={8}>
                      <Heading as="h2" size="lg" mb={4}>
                        {t('currentAlertsHeading')}
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {alertResources.map((resource) => (
                          <ResourceCard 
                            key={`${resource.source}-${resource.url}`} 
                            resource={resource} 
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                  
                  {/* Categories and resources */}
                  <Box mt={8}>
                    <ResourceCategories />
                    
                    {/* Resource list with automatic loading and error handling */}
                    <ResourceList showHeading={false} />
                  </Box>
                </Container>
              </Box>
            </>
          )}
        </Container>
        <Footer />
      </Box>
    </>
  );
} 