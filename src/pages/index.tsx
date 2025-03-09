import { useState, useEffect } from 'react';
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
  ResourceCard
} from '../components';

// Import types
import { ScrapedData } from '../types/resources';

// Import resource utilities
import { 
  formatDate, 
  getPriorityBadgeProps, 
  getResourceTypeWithYear,
  useResources
} from '../utils/resources';

// Import translation hook
import { useTranslation } from '../translations/useTranslation';

export default function Home() {
  // Use translation
  const { t } = useTranslation();
  
  // Use resource management hook
  const {
    filteredData,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    resourceType,
    setResourceType
  } = useResources();

  // State for tracking the active tab index
  const [tabIndex, setTabIndex] = useState(0);

  // Effect to switch to "All Information" tab when search is performed
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setTabIndex(4); // Switch to "All Information" tab when searching
    }
  }, [searchTerm]);

  // Get color mode
  const { colorMode, toggleColorMode } = useColorMode();

  // Options for the search filters
  const sourceOptions = [
    { value: 'all', label: t('filters.allSources') },
    { value: 'State Department', label: 'State Department' },
    { value: 'TSA', label: 'TSA' },
    { value: 'Lambda Legal', label: 'Lambda Legal' },
    { value: 'ACLU', label: 'ACLU' },
    { value: 'NCTE', label: 'National Center for Transgender Equality' },
    { value: 'Permanent Resource', label: 'Permanent Resources' }
  ];

  const resourceTypeOptions = [
    { value: 'all', label: t('filters.allTypes') },
    { value: 'documentation', label: 'Documentation & ID' },
    { value: 'safety', label: 'Safety & Security' },
    { value: 'resources', label: 'Support Resources' },
    { value: 'checklist', label: 'Checklists' }
  ];

  return (
    <>
      <Head>
        <title>{`${t('general.siteTitle')} - Information for Trans Travelers`}</title>
        <meta name="description" content={t('general.siteDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box 
        minH="100vh" 
        bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      >
        <Container maxW="container.xl" py={8}>
          {/* Header */}
          <Header colorMode={colorMode} toggleColorMode={toggleColorMode} />

          <Text fontSize="lg" color={colorMode === 'light' ? 'gray.700' : 'gray.300'} mb={8}>
            {t('general.siteDescription')}
          </Text>

          {/* Loading, Error, or Content */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorAlert error={error} />
          ) : (
            <>
              {/* Search and filters */}
              <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                resourceType={resourceType}
                setResourceType={setResourceType}
                sourceOptions={sourceOptions}
                resourceTypeOptions={resourceTypeOptions}
              />

              {/* Main content tabs */}
              <Tabs 
                colorScheme="blue" 
                variant="enclosed" 
                index={tabIndex} 
                onChange={(index) => setTabIndex(index)}
              >
                <TabList>
                  <Tab>{t('tabs.currentAlerts')}</Tab>
                  <Tab>{t('tabs.travelPlanning')}</Tab>
                  <Tab>{t('tabs.documentation')}</Tab>
                  <Tab>{t('tabs.legalResources')}</Tab>
                  <Tab>{t('tabs.allResources')}</Tab>
                </TabList>

                <TabPanels>
                  {/* CURRENT ALERTS TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.currentAlerts')}</Heading>
                      <Text>
                        {t('content.alertsDescription')}
                      </Text>

                      {/* Primary Passport Alert - Keep only this main alert for visual clarity */}
                      <Alert status="warning" borderRadius="md" mt={4}>
                        <AlertIcon />
                        <Text>
                          {t('content.passportUpdate')}
                        </Text>
                      </Alert>

                      {/* Travel Advisories as cards instead of alerts */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => (
                            // Only include truly important, time-sensitive alerts in this section
                            (item.title.toLowerCase().includes('warning') && 
                             item.lastUpdated && 
                             new Date(item.lastUpdated) > new Date('2025-02-15')) || // Only recent warnings
                            (item.title.toLowerCase().includes('advisory')) || // Include all advisories
                            // New Jersey travel advisory
                            (item.source?.toLowerCase().includes('garden state')) ||
                            // Specifically include resources about current visa/entry policies  
                            (item.source?.toLowerCase().includes('advocate') && 
                             item.title.toLowerCase().includes('germany')) ||
                            (item.source?.toLowerCase().includes('erin') && 
                             item.title.toLowerCase().includes('visa'))
                          ))
                          .map((item, index) => (
                            <ResourceCard
                              key={`alert-${index}`}
                              resource={item}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* TRAVEL PLANNING TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.travelPlanning')}</Heading>
                      <Text>
                        {t('content.travelPlanningDescription')}
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {filteredData
                          .filter(item => 
                            item.tags?.some(tag => 
                              tag.toLowerCase().includes('travel') || 
                              tag.toLowerCase().includes('planning') ||
                              tag.toLowerCase().includes('security')
                            ) ||
                            item.title.toLowerCase().includes('travel') ||
                            item.title.toLowerCase().includes('security') ||
                            item.title.toLowerCase().includes('tsa') ||
                            item.source?.toLowerCase().includes('tsa')
                          )
                          .map((resource, index) => (
                            <ResourceCard
                              key={`travel-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                  
                  {/* DOCUMENTATION TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.documentation')}</Heading>
                      <Text>
                        {t('content.documentationDescription')}
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {filteredData
                          .filter(item => 
                            item.tags?.some(tag => 
                              tag.toLowerCase().includes('documentation') || 
                              tag.toLowerCase().includes('passport') ||
                              tag.toLowerCase().includes('id') ||
                              tag.toLowerCase().includes('identity')
                            ) ||
                            item.title.toLowerCase().includes('passport') ||
                            item.title.toLowerCase().includes('id') ||
                            item.title.toLowerCase().includes('document') ||
                            item.content?.toLowerCase().includes('passport policy') ||
                            item.content?.toLowerCase().includes('gender marker')
                          )
                          .map((resource, index) => (
                            <ResourceCard
                              key={`doc-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                  
                  {/* LEGAL RESOURCES TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.legalResources')}</Heading>
                      <Text>
                        {t('content.legalResourcesDescription')}
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {filteredData
                          .filter(item => 
                            item.tags?.some(tag => 
                              tag.toLowerCase().includes('legal') || 
                              tag.toLowerCase().includes('resource') ||
                              tag.toLowerCase().includes('support')
                            ) ||
                            item.title.toLowerCase().includes('legal') ||
                            item.title.toLowerCase().includes('right') ||
                            item.title.toLowerCase().includes('support') ||
                            item.source?.toLowerCase().includes('lambda legal') ||
                            item.source?.toLowerCase().includes('aclu') ||
                            item.source?.toLowerCase().includes('transgender law')
                          )
                          .map((resource, index) => (
                            <ResourceCard
                              key={`legal-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                  
                  {/* ALL INFORMATION TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.allResources')}</Heading>
                      <Text>
                        {t('content.allResourcesDescription')}
                      </Text>
                      
                      {filteredData.length === 0 ? (
                        <Alert status="info" borderRadius="md" mt={4}>
                          <AlertIcon />
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">{t('alerts.noResults')}</Text>
                            <Text>{t('alerts.tryAdjusting')}</Text>
                          </VStack>
                        </Alert>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {filteredData.map((resource, index) => (
                            <ResourceCard
                              key={`all-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))}
                        </SimpleGrid>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </Container>
      </Box>
    </>
  );
} 