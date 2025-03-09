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
  ResourceCard,
  Footer
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

// Import static alerts
import staticAlerts from '../data/staticAlerts';

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

                      {/* Static Passport Alert */}
                      {staticAlerts.currentAlerts.map((alert, idx) => (
                        <Alert key={`static-alert-current-${idx}`} status={alert.status as any} borderRadius="md" mt={4}>
                          <AlertIcon />
                          <Text>{alert.text}</Text>
                        </Alert>
                      ))}

                      {/* Travel Advisories as cards */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => {
                            const title = item.title?.toLowerCase() || '';
                            const source = item.source?.toLowerCase() || '';
                            const content = item.content?.toLowerCase() || '';
                            
                            // Exclude State Department international travel guidance
                            if (source.includes('u.s. department of state') && 
                                (title.includes('international travel') || 
                                 title.includes('travel guidance') ||
                                 (content.includes('country-specific') && 
                                  content.includes('lgbtqi+')))) {
                              return false;
                            }
                            
                            // Include important alerts
                            return (
                              // Only include truly important, time-sensitive alerts in this section
                              (title.includes('warning') && 
                               item.lastUpdated && 
                               new Date(item.lastUpdated) > new Date('2025-02-15')) || // Only recent warnings
                              (title.includes('advisory')) || // Include all advisories
                              title.includes('alert') || // Include alerts
                              // New Jersey travel advisory
                              (source.includes('garden state')) ||
                              // Specifically include resources about current visa/entry policies  
                              (source.includes('advocate') && 
                               title.includes('germany')) ||
                              (source.includes('erin') && 
                               title.includes('visa')) ||
                              // Ensure the Marco Rubio visa ban news is included
                              (title.includes('rubio') && 
                               title.includes('transgender')) ||
                              // Ensure Germany travel advisory is included
                              (title.includes('germany') && 
                               title.includes('transgender'))
                            );
                          })
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
                      
                      {/* Static Travel Planning Alerts */}
                      {staticAlerts.travelPlanning.map((alert, idx) => (
                        <Alert key={`static-alert-travel-${idx}`} status={alert.status as any} borderRadius="md" mt={4}>
                          <AlertIcon />
                          <Text>{alert.text}</Text>
                        </Alert>
                      ))}
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {filteredData
                          .filter(item => {
                            const title = item.title?.toLowerCase() || '';
                            const source = item.source?.toLowerCase() || '';
                            const content = item.content?.toLowerCase() || '';
                            const tags = item.tags?.map(tag => tag.toLowerCase()) || [];
                            
                            // Include relevant travel planning content
                            const isRelevant = (
                              (title.includes('visa') || 
                               content.includes('visa policy') ||
                               content.includes('visa requirement')) ||
                              (source.includes('erin') && 
                               (title.includes('travel') || 
                                title.includes('border'))) ||
                              tags.some(tag => 
                                tag.includes('travel') || 
                                tag.includes('planning')
                              ) ||
                              title.includes('travel')
                            );
                            
                            // Exclude unwanted content types
                            const shouldExclude = 
                              title.includes('precheck') ||
                              content.includes('tsa precheck') ||
                              (source.includes('tsa')) ||
                              (source.includes('state department') && 
                               title.includes('notice')) ||
                              title.includes('step program') ||
                              content.includes('smart traveler enrollment') ||
                              // Specifically exclude State Department international travel
                              (source.includes('u.s. department of state') && 
                               (title.includes('international travel') || 
                                title.includes('travel guidance') ||
                                (content.includes('country-specific') && 
                                 content.includes('lgbtqi+'))));
                              
                            return isRelevant && !shouldExclude;
                          })
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
                  
                  {/* IDENTITY DOCUMENTS TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.documentation')}</Heading>
                      <Text>
                        {t('content.documentationDescription')}
                      </Text>
                      
                      {/* Static Identity Documents Alerts */}
                      {staticAlerts.identityDocuments.map((alert, idx) => (
                        <Alert key={`static-alert-identity-${idx}`} status={alert.status as any} borderRadius="md" mt={4}>
                          <AlertIcon />
                          <Text>{alert.text}</Text>
                        </Alert>
                      ))}
                      
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
                            item.title.toLowerCase().includes('id ') || // Space after "id" to avoid partial matches
                            item.title.toLowerCase().includes('identity') ||
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
                  
                  {/* COMMUNITY RESOURCES TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>{t('tabs.legalResources')}</Heading>
                      <Text>
                        {t('content.legalResourcesDescription')}
                      </Text>
                      
                      {/* Static Community Resources Alerts (currently none) */}
                      {staticAlerts.communityResources.map((alert, idx) => (
                        <Alert key={`static-alert-community-${idx}`} status={alert.status as any} borderRadius="md" mt={4}>
                          <AlertIcon />
                          <Text>{alert.text}</Text>
                        </Alert>
                      ))}
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {filteredData
                          .filter(item => {
                            const title = item.title?.toLowerCase() || '';
                            const source = item.source?.toLowerCase() || '';
                            const tags = item.tags?.map(tag => tag.toLowerCase()) || [];
                            
                            // Include relevant community resources
                            const isRelevant = tags.some(tag => 
                              tag.includes('community') || 
                              tag.includes('resource') ||
                              tag.includes('support')
                            ) ||
                            source.includes('lambda legal') ||
                            source.includes('transgender law');
                            
                            // Exclude unwanted content
                            const shouldExclude = 
                              title.includes('germany') ||
                              title.includes('rubio') ||
                              (source.includes('aclu') && 
                               (title.includes('workplace') || 
                                title.includes('employment')));
                                
                            return isRelevant && !shouldExclude;
                          })
                          .map((resource, index) => (
                            <ResourceCard
                              key={`community-${index}`}
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
                          {filteredData
                            // Exclude unwanted content from all resources tab
                            .filter(item => {
                              const title = item.title?.toLowerCase() || '';
                              const source = item.source?.toLowerCase() || '';
                              const content = item.content?.toLowerCase() || '';
                              
                              // Exclude TSA precheck content
                              if (title.includes('precheck') || content.includes('tsa precheck')) {
                                return false;
                              }
                              
                              // Exclude ACLU workplace discrimination content
                              if (source.includes('aclu') && 
                                  (title.includes('workplace') || title.includes('employment'))) {
                                return false;
                              }
                              
                              // Exclude STEP program information
                              if (title.includes('step program') || 
                                  content.includes('smart traveler enrollment')) {
                                return false;
                              }
                              
                              // Exclude general TSA content not specific to transgender travel
                              if (source.includes('tsa') && 
                                  !title.includes('transgender') && 
                                  !title.includes('nonbinary')) {
                                return false;
                              }
                              
                              // Exclude State Department international travel guidance
                              if (source.includes('u.s. department of state') && 
                                  (title.includes('international travel') || 
                                   title.includes('travel guidance') ||
                                   (content.includes('country-specific') && 
                                    content.includes('lgbtqi+')))) {
                                return false;
                              }
                              
                              return true;
                            })
                            .map((resource, index) => (
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
        <Footer />
      </Box>
    </>
  );
} 