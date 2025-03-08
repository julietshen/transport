import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  useColorMode,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  HStack,
  Badge,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Image,
  SimpleGrid,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';

interface ScrapedData {
  source: string;
  title: string;
  content: string;
  lastUpdated: string;
  url: string;
  tags?: string[];
  name?: string;
  category?: string;
}

export default function Home() {
  const [data, setData] = useState<ScrapedData[]>([]);
  const [filteredData, setFilteredData] = useState<ScrapedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set basePath based on environment
        const basePath = process.env.NODE_ENV === 'production' ? '/transport' : '';
        
        // Try to fetch from the root path first
        try {
          const response = await fetch(`${basePath}/scraped-data.json`);
          if (response.ok) {
            const jsonData = await response.json();
            // Sort data to prioritize scraped resources
            const sortedData = jsonData.sort(sortByPriorityAndDate);
            setData(sortedData);
            setFilteredData(sortedData);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch from primary path, trying fallback...');
        }
        
        // If that fails, try without basePath in development
        try {
          const fallbackResponse = await fetch('/scraped-data.json');
          if (fallbackResponse.ok) {
            const jsonData = await fallbackResponse.json();
            setData(jsonData);
            setFilteredData(jsonData);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch from fallback path...');
        }
        
        // If both attempts fail, throw an error
        throw new Error('Could not load data from any source');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Improve the logic to better identify scraped vs permanent resources
  const getResourceType = (item: ScrapedData): 'scraped' | 'permanent' => {
    // Resources from official government sources and legal organizations should be considered scraped
    // as they contain crucial policy information that may change
    if (
      // Government sources with policy information
      item.source === 'U.S. Department of State' ||
      item.source === 'Government' ||
      item.source === 'Garden State Equality' ||
      item.source === 'Lambda Legal' ||
      item.source === 'Aclu' ||
      item.source === 'Legal' ||
      
      // Tags related to policy or legal information
      (item.tags && (
        item.tags.includes('documentation') ||
        item.tags.includes('legal') ||
        item.tags.includes('passport') ||
        item.tags.includes('identification') ||
        item.tags.includes('screening')
      )) ||
      
      // Titles related to policy or advisories
      item.title.toLowerCase().includes('advisory') ||
      item.title.toLowerCase().includes('policy') ||
      item.title.toLowerCase().includes('passport') ||
      item.title.toLowerCase().includes('gender marker') ||
      item.title.toLowerCase().includes('screening')
    ) {
      return 'scraped';
    }
    
    // All other resources are considered permanent
    return 'permanent';
  };

  // Sort function to prioritize scraped resources (more likely to be updated)
  const sortByPriorityAndDate = (a: ScrapedData, b: ScrapedData): number => {
    // First prioritize scraped vs permanent
    const aIsScraped = getResourceType(a) === 'scraped';
    const bIsScraped = getResourceType(b) === 'scraped';
    
    if (aIsScraped && !bIsScraped) return -1;
    if (!aIsScraped && bIsScraped) return 1;
    
    // Then prioritize by date
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  };

  // Apply sorting to data and filtered data
  useEffect(() => {
    if (data.length > 0) {
      const sortedData = [...data].sort(sortByPriorityAndDate);
      setData(sortedData);
      setFilteredData(sortedData.filter(item => 
        (selectedSource === 'all' || item.source === selectedSource) &&
        (resourceType === 'all' || getResourceType(item) === resourceType) &&
        (!searchTerm || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ));
    }
  }, [data.length, selectedSource, resourceType, searchTerm]);

  // Get unique sources for the filter dropdown
  const uniqueSources = Array.from(new Set(data.map(item => item.source)));

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Head>
        <title>Transport</title>
        <meta name="description" content="Information hub for transgender travelers" />
      </Head>
      <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }}
              gap={4}
            >
              <VStack align="flex-start" spacing={1}>
                <Heading
                  as="h1"
                  size="2xl"
                  mb={4}
                  bgGradient="linear(to-r, #5BCEFA, #F5A9B8, #FFFFFF, #F5A9B8, #5BCEFA)"
                  bgClip="text"
                  textShadow={colorMode === 'light' ? '0px 0px 4px rgba(0, 0, 0, 0.4)' : 'none'}
                  sx={{
                    WebkitTextStroke: colorMode === 'light' ? '1px rgba(0, 0, 0, 0.3)' : 'none',
                    letterSpacing: '1px'
                  }}
                >
                  Transport
                </Heading>
                <Text fontSize="md" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                  Updated information for transgender travelers
                </Text>
              </VStack>
              <Button onClick={toggleColorMode} aria-label="Toggle color mode">
                {colorMode === 'light' ? '🌙 Dark' : '☀️ Light'}
              </Button>
            </Flex>

            <Text fontSize="lg" color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
              Your comprehensive resource for transgender travel information, automatically updated with the latest guidance and advisories 
              from government agencies and advocacy organizations.
            </Text>

            {isLoading ? (
              <Flex justify="center" py={12}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text>Loading travel information...</Text>
                </VStack>
              </Flex>
            ) : error ? (
              <Alert status="error" variant="solid" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            ) : (
              <>
                <Tabs colorScheme="blue" variant="enclosed">
                  <TabList>
                    <Tab>Travel Advisories</Tab>
                    <Tab>Passport & ID</Tab>
                    <Tab>Security Screening</Tab>
                    <Tab>Resources</Tab>
                    <Tab>All Information</Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* Travel Advisories Tab - Now First */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Travel Advisories</Heading>
                        <Text>
                          Critical travel advisories and safety information for transgender travelers
                          in various states and countries with restrictive laws.
                        </Text>
                        
                        <Alert status="warning" variant="left-accent" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Policy Changes Alert</Text>
                            <Text>
                              Laws affecting transgender rights are changing rapidly. Some U.S. states and countries have enacted
                              legislation that may impact transgender travelers. Always research your destination before travel.
                            </Text>
                          </VStack>
                        </Alert>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {data
                            .filter(item => 
                              item.title.toLowerCase().includes('advisory') ||
                              item.title.toLowerCase().includes('safety') ||
                              item.title.toLowerCase().includes('warning') ||
                              item.source === 'Garden State Equality' ||
                              (item.tags && item.tags.includes('safety'))
                            )
                            .map((item, index) => (
                              <Box
                                key={index}
                                p={5}
                                borderWidth="1px"
                                borderRadius="lg"
                                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                                boxShadow="sm"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <Heading size="md">{item.title}</Heading>
                                  <HStack>
                                    <Badge colorScheme="red" width="fit-content">
                                      {item.source}
                                    </Badge>
                                    <Badge 
                                      colorScheme={getResourceType(item) === 'permanent' ? 'green' : 'purple'} 
                                      size="sm"
                                    >
                                      {getResourceType(item) === 'permanent' ? 'Permanent' : 'Scraped'}
                                    </Badge>
                                  </HStack>
                                  <Text>{item.content.length > 300 
                                    ? `${item.content.substring(0, 300).trim()}...` 
                                    : item.content}
                                  </Text>
                                  <Link
                                    href={item.url}
                                    color="blue.500"
                                    isExternal
                                    fontWeight="medium"
                                  >
                                    Read Full Advisory ↗
                                  </Link>
                                </VStack>
                              </Box>
                            ))
                          }
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                    
                    {/* Passport & ID Tab - Now Second */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Passport & ID Documentation</Heading>
                        <Text>
                          Essential information about identification documents, passport requirements, 
                          and gender marker changes for transgender travelers.
                        </Text>
                        
                        <Alert status="info" variant="left-accent" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Important Update</Text>
                            <Text>
                              U.S. policies now allow for an "X" gender marker on passports. The process requires a self-signed 
                              affidavit of gender identity rather than medical certification.
                            </Text>
                          </VStack>
                        </Alert>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {data
                            .filter(item => 
                              item.source === 'Documentation' || 
                              item.source === 'U.S. Department of State' ||
                              item.title.toLowerCase().includes('passport') ||
                              item.title.toLowerCase().includes('document') ||
                              item.title.toLowerCase().includes('identification') ||
                              item.title.toLowerCase().includes('gender marker') ||
                              item.title.toLowerCase().includes('sex marker') ||
                              (item.tags && item.tags.includes('documentation'))
                            )
                            .map((item, index) => (
                              <Box
                                key={index}
                                p={5}
                                borderWidth="1px"
                                borderRadius="lg"
                                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                                boxShadow="sm"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <Heading size="md">{item.title}</Heading>
                                  <HStack>
                                    <Badge colorScheme="purple" width="fit-content">
                                      {item.source}
                                    </Badge>
                                    <Badge 
                                      colorScheme={getResourceType(item) === 'permanent' ? 'green' : 'purple'} 
                                      size="sm"
                                    >
                                      {getResourceType(item) === 'permanent' ? 'Permanent' : 'Scraped'}
                                    </Badge>
                                  </HStack>
                                  <Text>{item.content.length > 300 
                                    ? `${item.content.substring(0, 300).trim()}...` 
                                    : item.content}
                                  </Text>
                                  {item.url && item.url !== "/documentation" && (
                                    <Link
                                      href={item.url}
                                      color="blue.500"
                                      isExternal
                                      fontWeight="medium"
                                    >
                                      Read More ↗
                                    </Link>
                                  )}
                                </VStack>
                              </Box>
                            ))
                          }
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                    
                    {/* Security Screening Tab - Now Third */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Security Screening Information</Heading>
                        <Text>
                          Important information about security screening procedures at airports and other transit points,
                          with guidance for transgender and non-binary travelers.
                        </Text>
                        
                        <Alert status="info" variant="left-accent" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Know Your Rights</Text>
                            <Text>
                              TSA officers should treat all travelers with respect. You have the right to opt out of body scanners
                              and request a private screening. You do not have to remove prosthetics or binders during screening.
                            </Text>
                          </VStack>
                        </Alert>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {data
                            .filter(item => 
                              item.source === 'Security' || 
                              item.title.toLowerCase().includes('security') ||
                              item.title.toLowerCase().includes('screening') ||
                              item.title.toLowerCase().includes('tsa') ||
                              item.title.toLowerCase().includes('airport')
                            )
                            .map((item, index) => (
                              <Box
                                key={index}
                                p={5}
                                borderWidth="1px"
                                borderRadius="lg"
                                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                                boxShadow="sm"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <Heading size="md">{item.title}</Heading>
                                  <HStack>
                                    <Badge colorScheme="blue" width="fit-content">
                                      {item.source}
                                    </Badge>
                                    <Badge 
                                      colorScheme={getResourceType(item) === 'permanent' ? 'green' : 'purple'} 
                                      size="sm"
                                    >
                                      {getResourceType(item) === 'permanent' ? 'Permanent' : 'Scraped'}
                                    </Badge>
                                  </HStack>
                                  <Text noOfLines={4}>{item.content}</Text>
                                  {item.url && item.url !== "/screening" && (
                                    <Link
                                      href={item.url}
                                      color="blue.500"
                                      isExternal
                                      fontWeight="medium"
                                    >
                                      Read More ↗
                                    </Link>
                                  )}
                                </VStack>
                              </Box>
                            ))
                          }
                        </SimpleGrid>
                        
                        <Box
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
                        >
                          <Heading size="sm" mb={2}>Verified External Resources</Heading>
                          <HStack wrap="wrap" spacing={4}>
                            <Link href="https://www.tsa.gov/transgender-passengers" isExternal color="blue.500">
                              TSA: Transgender Passengers
                            </Link>
                            <Link href="https://transequality.org/know-your-rights/airport-security" isExternal color="blue.500">
                              NCTE: Airport Security
                            </Link>
                          </HStack>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    {/* Resources Tab - New Fourth Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Resources</Heading>
                        <Text>
                          Helpful tools, apps, and community resources for transgender travelers that are less subject to
                          policy changes.
                        </Text>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          {data
                            .filter(item => getResourceType(item) === 'permanent')
                            .map((item, index) => (
                              <Box
                                key={index}
                                p={5}
                                borderWidth="1px"
                                borderRadius="lg"
                                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                                boxShadow="sm"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <Heading size="md">{item.title}</Heading>
                                  <HStack>
                                    <Badge colorScheme="green" width="fit-content">
                                      {item.source}
                                    </Badge>
                                    <Badge colorScheme="green" size="sm">
                                      Permanent
                                    </Badge>
                                  </HStack>
                                  <Text noOfLines={4}>{item.content}</Text>
                                  <Link
                                    href={item.url}
                                    color="blue.500"
                                    isExternal
                                    fontWeight="medium"
                                  >
                                    Visit Resource ↗
                                  </Link>
                                </VStack>
                              </Box>
                            ))
                          }
                        </SimpleGrid>
                        
                        <Heading size="md" mt={8} mb={4}>Resource Categories</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="sm">Community Resources</Heading>
                              <Text fontSize="sm">Resources to help you connect with local communities during travel</Text>
                              {data
                                .filter(item => item.category === 'Community')
                                .map((item, idx) => (
                                  <Link key={idx} href={item.url} isExternal color="blue.500">
                                    {item.name || item.title}
                                  </Link>
                                ))
                              }
                            </VStack>
                          </Box>
                          
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="sm">Digital Tools</Heading>
                              <Text fontSize="sm">Apps and digital resources for travel planning and safety</Text>
                              {data
                                .filter(item => item.category === 'Digital Tools')
                                .map((item, idx) => (
                                  <Link key={idx} href={item.url} isExternal color="blue.500">
                                    {item.name || item.title}
                                  </Link>
                                ))
                              }
                            </VStack>
                          </Box>
                          
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="sm">Healthcare Resources</Heading>
                              <Text fontSize="sm">Medical resources for transgender travelers</Text>
                              {data
                                .filter(item => item.source === 'Healthcare' || (item.tags && item.tags.includes('healthcare')))
                                .map((item, idx) => (
                                  <Link key={idx} href={item.url} isExternal color="blue.500">
                                    {item.name || item.title}
                                  </Link>
                                ))
                              }
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                    
                    {/* All Information Tab - Now Last */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Flex 
                          direction={{ base: 'column', md: 'row' }} 
                          gap={4} 
                          align={{ base: 'stretch', md: 'center' }}
                        >
                          <InputGroup flex="1">
                            <InputLeftElement pointerEvents="none">
                              🔍
                            </InputLeftElement>
                            <Input
                              placeholder="Search for information..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              bg={colorMode === 'light' ? 'white' : 'gray.700'}
                              borderRadius="md"
                            />
                          </InputGroup>
                          
                          <Select 
                            value={selectedSource} 
                            onChange={(e) => setSelectedSource(e.target.value)}
                            width={{ base: '100%', md: '200px' }}
                            bg={colorMode === 'light' ? 'white' : 'gray.700'}
                            borderRadius="md"
                          >
                            <option value="all">All Sources</option>
                            {uniqueSources.map(source => (
                              <option key={source} value={source}>{source}</option>
                            ))}
                          </Select>
                          
                          <Flex alignItems="center">
                            <Select 
                              value={resourceType} 
                              onChange={(e) => setResourceType(e.target.value)}
                              width={{ base: '100%', md: '200px' }}
                              bg={colorMode === 'light' ? 'white' : 'gray.700'}
                              borderRadius="md"
                              mr={2}
                            >
                              <option value="all">All Resources</option>
                              <option value="scraped">Scraped</option>
                              <option value="permanent">Permanent</option>
                            </Select>
                            <Tooltip 
                              label="Scraped resources are dynamically updated from external websites. Permanent resources are hand-curated and always available."
                              placement="top"
                              hasArrow
                            >
                              <Box as="span" fontSize="lg" fontWeight="bold" cursor="help">ⓘ</Box>
                            </Tooltip>
                          </Flex>
                        </Flex>
                        
                        {filteredData.length === 0 ? (
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            No results found. Try adjusting your search or filters.
                          </Alert>
                        ) : (
                          <Accordion allowMultiple>
                            {filteredData.map((item, index) => (
                              <AccordionItem 
                                key={index} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                mb={4}
                                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
                                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                                boxShadow="sm"
                                overflow="hidden"
                              >
                                <h2>
                                  <AccordionButton py={4}>
                                    <Box flex="1" textAlign="left">
                                      <HStack>
                                        <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                                          {item.source}
                                        </Badge>
                                        <Badge 
                                          colorScheme={getResourceType(item) === 'permanent' ? 'green' : 'purple'} 
                                          size="sm"
                                          px={2}
                                          py={0.5}
                                          borderRadius="md"
                                        >
                                          {getResourceType(item) === 'permanent' ? 'Permanent' : 'Scraped'}
                                        </Badge>
                                        <Text fontWeight="bold" fontSize="lg">{item.title}</Text>
                                      </HStack>
                                      <Text fontSize="sm" color="gray.500" mt={1}>
                                        Last updated: {formatDate(item.lastUpdated)}
                                      </Text>
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={6}>
                                  <VStack align="stretch" spacing={4}>
                                    <Text>{item.content}</Text>
                                    {item.url && item.url !== "/" && (
                                      <Link
                                        href={item.url}
                                        color="blue.500"
                                        isExternal
                                        fontWeight="medium"
                                        display="inline-flex"
                                        alignItems="center"
                                      >
                                        View Original Source {' '}
                                        <Text as="span" ml={1}>↗</Text>
                                      </Link>
                                    )}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
            
            <Divider my={8} />
            
            <VStack spacing={4} align="stretch">
              <Heading size="md">About This Resource</Heading>
              <Text>
                This information hub for transgender travelers is automatically updated with the latest information from official government 
                sources and trusted advocacy organizations. The content is refreshed regularly to ensure accuracy during this time of 
                constant policy change.
              </Text>
              <Text>
                For emergency situations or legal assistance while traveling, contact Lambda Legal's Help Desk at 212-809-8585 or 
                the National Center for Transgender Equality at 202-642-4542.
              </Text>
              <Divider my={4} />
              <Text>
                This resource was vibe coded by an ally of the transgender community and welcomes contributions. 
                Information may be outdated and vetting isn't perfect, but we hope that this resource helps those who need it during 
                these challenging times of policy changes affecting transgender rights.
              </Text>
              <Flex align="center">
                <Link href="https://github.com/yourusername/transport" isExternal mr={2} display="flex" alignItems="center">
                  <Box as="i" className="fab fa-github" mr={2} fontSize="20px" />
                  <Text>Contribute on GitHub</Text>
                </Link>
              </Flex>
              <Text fontSize="sm" color="gray.500">
                Last updated: {data.length > 0 ? formatDate(data[0].lastUpdated) : 'Loading...'}
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  );
} 