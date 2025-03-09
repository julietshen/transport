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

export default function Home() {
  // Use the custom hook for resource management
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
    { value: 'all', label: 'All Sources' },
    { value: 'State Department', label: 'State Department' },
    { value: 'TSA', label: 'TSA' },
    { value: 'Lambda Legal', label: 'Lambda Legal' },
    { value: 'ACLU', label: 'ACLU' },
    { value: 'NCTE', label: 'National Center for Transgender Equality' },
    { value: 'Permanent Resource', label: 'Permanent Resources' }
  ];

  const resourceTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'documentation', label: 'Documentation & ID' },
    { value: 'safety', label: 'Safety & Security' },
    { value: 'resources', label: 'Support Resources' },
    { value: 'checklist', label: 'Checklists' }
  ];

  return (
    <>
      <Head>
        <title>Transport - Information for Trans Travelers</title>
        <meta name="description" content="Your comprehensive resource for transgender travel information, automatically updated with the latest guidance and advisories." />
      </Head>

      <Box 
        minH="100vh" 
        bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      >
        <Container maxW="container.xl" py={8}>
          {/* Header */}
          <Header colorMode={colorMode} toggleColorMode={toggleColorMode} />

          <Text fontSize="lg" color={colorMode === 'light' ? 'gray.700' : 'gray.300'} mb={8}>
            Your comprehensive resource for transgender travel information, automatically updated with the latest guidance and advisories 
            from government agencies and advocacy organizations.
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
                  <Tab>Current Alerts</Tab>
                  <Tab>Travel Planning</Tab>
                  <Tab>Documentation</Tab>
                  <Tab>Support Resources</Tab>
                  <Tab>All Information</Tab>
                </TabList>

                <TabPanels>
                  {/* CURRENT ALERTS TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>Current Alerts</Heading>
                      <Text>
                        Critical updates and time-sensitive information for trans and nonbinary travelers.
                        These alerts highlight recent policy changes, travel restrictions, and safety concerns.
                      </Text>

                      {/* Primary Passport Alert - Keep only this main alert for visual clarity */}
                      <Alert status="warning" borderRadius="md" mt={4}>
                        <AlertIcon />
                        <Text>
                          PASSPORT UPDATE (March 2025): The U.S. State Department is currently no longer issuing new passports with X gender markers. 
                          Previously issued X-marker passports remain valid until their expiration date. Some travelers have reported that 
                          their X gender marker passport renewals are being processed with their sex assigned at birth. For guidance, 
                          consider contacting the National Center for Transgender Equality or Lambda Legal for assistance.
                        </Text>
                      </Alert>

                      {/* Travel Advisories as cards instead of alerts */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => 
                            // Only include truly important, time-sensitive alerts in this section
                            ((item.title.toLowerCase().includes('warning') && 
                              item.lastUpdated && 
                              new Date(item.lastUpdated) > new Date('2025-02-15')) || // Only recent warnings
                             (item.title.toLowerCase().includes('advisory')) || // Include all advisories
                             // New Jersey travel advisory
                             (item.source?.toLowerCase().includes('garden state')) ||
                             // Specifically include resources about current visa/entry policies  
                             (item.source?.toLowerCase().includes('advocate') && 
                              item.title.toLowerCase().includes('germany')) ||
                             (item.source?.toLowerCase().includes('erin') && 
                              item.title.toLowerCase().includes('rubio')))
                             // Don't include Trans World Express in current alerts
                             && !(item.source?.toLowerCase().includes('trans world express'))
                          )
                          .slice(0, 8) /* Limit alerts to avoid overwhelming */
                          .map((resource, index) => (
                            <ResourceCard
                              key={`alert-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))
                        }
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* TRAVEL PLANNING TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>Travel Planning</Heading>
                      <Text>
                        Resources to help you plan your travel as a transgender or nonbinary person.
                        Learn about preparing for security screening, what to pack, and other travel considerations.
                      </Text>

                      {/* Move visa processing info alert to planning tab */}
                      <Alert status="info" borderRadius="md" mt={4}>
                        <AlertIcon />
                        <Text>
                          Recent reports suggest potential changes to visa processing for transgender travelers. Some advocacy 
                          organizations have noted increased scrutiny and delays for certain applicants. While official policies 
                          remain unclear, travelers should allow extra time for documentation processing and consider consulting 
                          with organizations like the National Center for Transgender Equality or Lambda Legal for guidance.
                        </Text>
                      </Alert>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => 
                            item.title.toLowerCase().includes('planning') ||
                            item.title.toLowerCase().includes('checklist') ||
                            item.title.toLowerCase().includes('guide') ||
                            item.title.toLowerCase().includes('tips') ||
                            // Ensure emergency resources appear in planning
                            item.tags?.includes('emergency') ||
                            item.title.toLowerCase().includes('network')
                          )
                          .slice(0, 9)
                          .map((resource, index) => (
                            <ResourceCard
                              key={`planning-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))
                        }
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* DOCUMENTATION TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>Documentation</Heading>
                      <Text>
                        Important information about identity documents for transgender and nonbinary travelers,
                        including passports, IDs, and required documentation for domestic and international travel.
                      </Text>

                      {/* Passport X Gender Marker Alert - Important for Documentation Tab */}
                      <Alert status="warning" borderRadius="md" mt={4}>
                        <AlertIcon />
                        <Text>
                          <strong>PASSPORT UPDATE (March 2025):</strong> The State Department has reportedly changed how it processes 
                          gender markers on passports. Travelers with existing X gender marker passports report their documents remain 
                          valid for travel through their expiration date, but renewals may be issued with sex assigned at birth. 
                          Travel with documentation that matches all your other identification when possible. For guidance on navigating 
                          these changes, contact advocacy organizations like the Transgender Law Center or Lambda Legal.
                        </Text>
                      </Alert>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => 
                            item.title.toLowerCase().includes('passport') ||
                            item.title.toLowerCase().includes('id') ||
                            item.title.toLowerCase().includes('document') ||
                            item.title.toLowerCase().includes('identification') ||
                            // Include X gender marker content and passport gender issues
                            item.content?.toLowerCase().includes('x gender marker') ||
                            item.content?.toLowerCase().includes('gender marker') ||
                            (item.content?.toLowerCase().includes('passport') && 
                             item.content?.toLowerCase().includes('gender')) ||
                            // Specifically ensure Travel While Trans is included in Documentation
                            (item.name?.toLowerCase().includes('travel while trans')) ||
                            (item.url && item.url.includes('travelwhiletrans.com'))
                          )
                          .slice(0, 9)
                          .map((resource, index) => (
                            <ResourceCard
                              key={`doc-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))
                        }
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* SUPPORT RESOURCES TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>Support Resources</Heading>
                      <Text>
                        Organizations, hotlines, and services that provide assistance and support to transgender 
                        and nonbinary travelers. These resources can help if you encounter issues during your travels.
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                        {filteredData
                          .filter(item => 
                            item.title.toLowerCase().includes('resource') ||
                            item.title.toLowerCase().includes('support') ||
                            item.title.toLowerCase().includes('assistance') ||
                            item.tags?.includes('community') ||
                            // Specifically include support networks
                            (item.source?.toLowerCase().includes('trans world express')) ||
                            item.title.toLowerCase().includes('network') ||
                            item.content?.toLowerCase().includes('support')
                          )
                          .slice(0, 9)
                          .map((resource, index) => (
                            <ResourceCard
                              key={`support-${index}`}
                              resource={resource}
                              colorMode={colorMode}
                              formatDate={formatDate}
                              getPriorityBadgeProps={getPriorityBadgeProps}
                              getResourceTypeWithYear={getResourceTypeWithYear}
                            />
                          ))
                        }
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* ALL INFORMATION TAB */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" mb={2}>All Resources</Heading>
                      <Text>
                        Complete listing of all travel information and resources for transgender and nonbinary travelers.
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
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