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
  UnorderedList,
  ListItem,
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

  // Function to filter out outdated or inappropriate resources
  const filterRemovedResources = (items: ScrapedData[]): ScrapedData[] => {
    return items.filter(item => {
      // Remove CDC resources as they no longer exist
      if (item.title === "CDC - Transgender Health" || 
          item.name === "CDC - Transgender Health" || 
          (item.source === "CDC" && item.title.toLowerCase().includes("transgender"))) {
        return false;
      }
      
      // Remove Lex as it's a social app, not an informational resource
      if (item.title === "Lex - Text-Centered Community Platform" || 
          item.name === "Lex" || 
          item.source === "Lex") {
        return false;
      }
      
      return true;
    });
  };

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
            // Filter out removed resources first
            const filteredResources = filterRemovedResources(jsonData);
            // Then sort data to prioritize scraped resources
            const sortedData = filteredResources.sort(sortByPriorityAndDate);
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
            // Filter out removed resources
            const filteredResources = filterRemovedResources(jsonData);
            const sortedData = filteredResources.sort(sortByPriorityAndDate);
            setData(sortedData);
            setFilteredData(sortedData);
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

  // Improve the logic to better identify resource priorities for transgender travelers
  const getResourcePriority = (item: ScrapedData): number => {
    const title = item.title.toLowerCase();
    const source = item.source.toLowerCase();
    const content = item.content.toLowerCase();
    const hasTags = item.tags && item.tags.length > 0;
    
    // Priority 1: Critical visa/passport policy changes and restrictions
    if (
      // International travel advisories issued by other countries
      ((title.includes('advisory') || title.includes('warning')) && 
        (title.includes('trans') || title.includes('nonbinary') || title.includes('lgbtq'))) ||
      (source.includes('german') || source.includes('foreign office') || source.includes('ministry')) ||
      // Visa/passport restrictions
      ((title.includes('visa') || title.includes('passport')) && 
       (title.includes('ban') || title.includes('restrict') || title.includes('denied'))) ||
      // State Department policy changes specifically affecting trans travelers
      ((source.includes('state department') || source.includes('department of state')) && 
        title.includes('trans')) ||
      // Sources like Erin In The Morning reporting on visa/passport issues
      (source.includes('erin in the morning') && 
       (content.includes('visa') || content.includes('passport'))) ||
      // Travel bans & restrictions
      (title.includes('ban') || content.includes('travel ban') || content.includes('entry restriction')) ||
      // Border crossing issues
      (title.includes('border') && title.includes('trans'))
    ) {
      return 1;
    }
    
    // Priority 2: Documentation guidance and legal rights information
    // Essential for planning travel but not as time-sensitive as new restrictions
    if (
      // Passport and ID document information
      (title.includes('passport') || title.includes('gender marker') || title.includes('identification')) ||
      // Legal rights information
      (source.includes('legal') || source.includes('aclu') || source.includes('lambda legal')) &&
        (content.includes('rights') || content.includes('protection')) ||
      // State-by-state guidance
      (title.includes('state') && (title.includes('law') || title.includes('legislation'))) ||
      // TSA/security screening information
      (title.includes('tsa') || title.includes('screening') || title.includes('security'))
    ) {
      return 2;
    }
    
    // Priority 3: Health resources and specialized travel services
    // Important but less urgent than legal/documentation issues
    if (
      // Healthcare access while traveling
      (title.includes('health') || title.includes('medical') || title.includes('care')) ||
      // Trans-friendly accommodations
      (title.includes('accommodation') || title.includes('hotel') || title.includes('stay')) ||
      // Trans-specific travel services
      (content.includes('trans-friendly') || content.includes('inclusive') || content.includes('safe space'))
    ) {
      return 3;
    }
    
    // Priority 4: General resources that might be helpful but less critical
    if (getResourceType(item) === 'scraped') {
      return 4;
    }
    
    // Priority 5: Permanent/static resources
    return 5;
  };

  // Sort function to prioritize by resource type and then by date
  const sortByPriorityAndDate = (a: ScrapedData, b: ScrapedData): number => {
    // First prioritize by resource type
    const aPriority = getResourcePriority(a);
    const bPriority = getResourcePriority(b);
    
    if (aPriority < bPriority) return -1;
    if (aPriority > bPriority) return 1;
    
    // For resources with the same priority, sort by date
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

  // Function to get the priority label and color based on priority level
  const getPriorityBadgeProps = (item: ScrapedData) => {
    const priority = getResourcePriority(item);
    
    switch(priority) {
      case 1:
        return { label: 'Critical', colorScheme: 'red' };
      case 2:
        return { label: 'Important', colorScheme: 'orange' };
      case 3:
        return { label: 'Helpful', colorScheme: 'blue' };
      case 4:
        return { label: 'General', colorScheme: 'gray' };
      default:
        return { label: 'Standard', colorScheme: 'green' };
    }
  };

  // First, let's modify the getResourceType function to include the year in the label
  const getResourceTypeWithYear = (item: ScrapedData): string => {
    const resourceType = getResourceType(item);
    
    if (resourceType === 'scraped') {
      // Extract year from lastUpdated field if it exists and is valid
      try {
        const updateDate = new Date(item.lastUpdated);
        const updateYear = updateDate.getFullYear();
        
        if (!isNaN(updateYear) && updateYear > 2020) {
          return `Updated ${updateYear}`;
        }
      } catch (e) {
        // If date parsing fails, fall back to generic label
      }
      
      // Fallback if no valid date is present
      return 'Recently updated';
    }
    
    return 'Permanent resource';
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
                          Critical updates and time-sensitive information for transgender travelers.
                          These alerts highlight recent policy changes, travel restrictions, and safety concerns.
                        </Text>
                        
                        {/* Passport Alert - without header */}
                        <Alert status="warning" borderRadius="md" mt={4}>
                          <AlertIcon />
                          <Text>
                            Due to recent policy changes, X gender markers are no longer being issued on US passports, and 
                            previously issued X-marker passports will not be renewed with that marker. The US State Department 
                            has stated that individuals with an X marker can apply for a replacement passport with their sex 
                            assigned at birth free of charge if their X passport was issued less than one year ago.
                          </Text>
                        </Alert>
                        
                        {/* Travel Advisories - without header */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                          {/* German Advisory Card */}
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                            boxShadow="sm"
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="md">Germany Issues Warning for Trans Travelers to US</Heading>
                              <HStack>
                                <Badge colorScheme="blue" width="fit-content">
                                  German Foreign Office
                                </Badge>
                                <Badge 
                                  colorScheme="red" 
                                  size="sm"
                                >
                                  CRITICAL
                                </Badge>
                                <Badge>March 2025</Badge>
                              </HStack>
                              <Text>
                                Germany has issued an official travel advisory warning transgender and nonbinary citizens about 
                                potential risks when traveling to the United States. The German Foreign Office advises travelers to 
                                contact US authorities before planning trips due to new policies restricting transgender people's 
                                travel documents. This follows executive orders requiring all US government documents to only 
                                reflect sex assigned at birth.
                              </Text>
                              <Link
                                href="https://www.advocate.com/news/germany-warns-transgender-travelers-us"
                                color="blue.500"
                                isExternal
                                fontWeight="medium"
                              >
                                Read Full Advisory ↗
                              </Link>
                            </VStack>
                          </Box>
                          
                          {/* UK Advisory Card */}
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                            boxShadow="sm"
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="md">UK Updates Travel Guidance for LGBTQ+ Citizens</Heading>
                              <HStack>
                                <Badge colorScheme="blue" width="fit-content">
                                  UK Foreign Office
                                </Badge>
                                <Badge 
                                  colorScheme="orange" 
                                  size="sm"
                                >
                                  ADVISORY
                                </Badge>
                                <Badge>February 2025</Badge>
                              </HStack>
                              <Text>
                                The UK Foreign, Commonwealth & Development Office has updated its travel guidance for LGBTQ+ citizens 
                                visiting the United States. The advisory notes changes to US immigration policies that may affect 
                                transgender travelers and recommends carrying documents that match birth sex to avoid complications 
                                at border control.
                              </Text>
                              <Link
                                href="#"
                                color="blue.500"
                                isExternal
                                fontWeight="medium"
                              >
                                Read More ↗
                              </Link>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                        
                        {/* US Policy Cards - without header */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                          {/* State Department Visa Restriction Card */}
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                            boxShadow="sm"
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="md">State Department Visa Restriction for Transgender Travelers</Heading>
                              <HStack>
                                <Badge colorScheme="blue" width="fit-content">
                                  Erin In The Morning
                                </Badge>
                                <Badge 
                                  colorScheme="red" 
                                  size="sm"
                                >
                                  CRITICAL
                                </Badge>
                                <Badge>March 2025</Badge>
                              </HStack>
                              <Text>
                                A recent State Department policy instructs consular officers to flag applications where 
                                there is "reasonable suspicion" that an applicant is transgender, a move critics say amounts 
                                to a ban on transgender visa holders. The policy implements the January 20, 2025 executive 
                                order mandating that all government-issued documents, including passports, reflect only an 
                                individual's sex assigned at birth.
                              </Text>
                              <Link
                                href="https://www.erininthemorning.com/p/marco-rubio-may-have-just-banned"
                                color="blue.500"
                                isExternal
                                fontWeight="medium"
                              >
                                Read Full Story ↗
                              </Link>
                            </VStack>
                          </Box>
                          
                          {/* Domestic Passport Issues Card */}
                          <Box
                            p={5}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={colorMode === 'light' ? 'white' : 'gray.800'}
                            boxShadow="sm"
                          >
                            <VStack align="stretch" spacing={3}>
                              <Heading size="md">Domestic Passport Issues Reported</Heading>
                              <HStack>
                                <Badge colorScheme="blue" width="fit-content">
                                  Erin In The Morning
                                </Badge>
                                <Badge 
                                  colorScheme="orange" 
                                  size="sm"
                                >
                                  ADVISORY
                                </Badge>
                                <Badge>February 2025</Badge>
                              </HStack>
                              <Text>
                                Transgender people within the United States are facing increasing restrictions on travel documents.
                                Many report that their applications for passport renewals or new issuances are being indefinitely 
                                held by the State Department. Some, including prominent figures, have received passports with 
                                incorrect gender markers. These practices are now the subject of ongoing litigation.
                              </Text>
                              <Link
                                href="https://www.erininthemorning.com/p/marco-rubio-may-have-just-banned"
                                color="blue.500"
                                isExternal
                                fontWeight="medium"
                              >
                                Read More ↗
                              </Link>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                    
                    {/* TRAVEL PLANNING TAB */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Travel Planning</Heading>
                        <Text>
                          Resources to help you safely plan your journey, including state-by-state information, screening guidance, 
                          and practical travel tips.
                        </Text>
                        
                        {/* Critical Alert for traveling transgender people */}
                        <Alert status="warning" borderRadius="md" mb={4}>
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">Recent Policy Changes Affecting Travel</Text>
                            <Text>
                              Multiple countries have issued advisories about changing US policies for transgender travelers.
                              Please check the Current Alerts tab for the latest critical updates before planning your trip.
                            </Text>
                          </VStack>
                        </Alert>
                        
                        {/* State Laws section - with conditional rendering and fallback content */}
                        <Box>
                          <Heading size="md" mb={4}>State & Regional Information</Heading>
                          
                          {/* Check if we have relevant content, if not show a fallback message */}
                          {data.filter(item => 
                            (item.title.toLowerCase().includes('state') && 
                              (item.title.toLowerCase().includes('law') || 
                              item.title.toLowerCase().includes('legislation'))) ||
                            (item.tags && (item.tags.includes('state') || item.tags.includes('regional')))
                          ).length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              {data
                                .filter(item => 
                                  (item.title.toLowerCase().includes('state') && 
                                    (item.title.toLowerCase().includes('law') || 
                                    item.title.toLowerCase().includes('legislation'))) ||
                                  (item.tags && (item.tags.includes('state') || item.tags.includes('regional')))
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
                                          {getResourceTypeWithYear(item)}
                                        </Badge>
                                      </HStack>
                                      <Text noOfLines={4}>{item.content}</Text>
                                      {item.url && (
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
                          ) : (
                            // Fallback content when no state/regional information is available
                            <Box
                              p={5}
                              borderWidth="1px"
                              borderRadius="lg"
                              bg={colorMode === 'light' ? 'white' : 'gray.800'}
                              boxShadow="sm"
                            >
                              <VStack align="stretch" spacing={4}>
                                <Text>
                                  Due to the rapidly changing landscape of state laws affecting transgender travelers, we 
                                  currently don't have up-to-date information on specific states. As of March 2025, numerous 
                                  states have enacted or are considering legislation that may impact transgender travelers.
                                </Text>
                                <Text fontWeight="medium">
                                  We recommend checking the following resources for the most current state-by-state information:
                                </Text>
                                <UnorderedList spacing={2} pl={4}>
                                  <ListItem>
                                    <Link 
                                      href="https://www.erininthemorning.com/" 
                                      isExternal 
                                      color="blue.500"
                                    >
                                      Erin In The Morning
                                    </Link>
                                    <Text fontSize="sm">Regularly updated tracking of anti-transgender legislation</Text>
                                  </ListItem>
                                  <ListItem>
                                    <Link 
                                      href="https://www.aclu.org/issues/lgbtq-rights" 
                                      isExternal 
                                      color="blue.500"
                                    >
                                      ACLU LGBTQ Rights
                                    </Link>
                                    <Text fontSize="sm">Legal information and state-by-state legislative tracking</Text>
                                  </ListItem>
                                  <ListItem>
                                    <Link 
                                      href="https://transequality.org/know-your-rights" 
                                      isExternal 
                                      color="blue.500"
                                    >
                                      National Center for Transgender Equality
                                    </Link>
                                    <Text fontSize="sm">Rights information and travel guidance</Text>
                                  </ListItem>
                                </UnorderedList>
                              </VStack>
                            </Box>
                          )}
                        </Box>
                        
                        {/* Security & Safety section - with similar conditional rendering */}
                        <Box mt={6}>
                          <Heading size="md" mb={4}>Security Screening & Safety</Heading>
                          
                          {/* Check if we have relevant content, if not show a fallback message */}
                          {data.filter(item => 
                            item.title.toLowerCase().includes('tsa') || 
                            item.title.toLowerCase().includes('screening') || 
                            item.title.toLowerCase().includes('security') ||
                            item.title.toLowerCase().includes('safety') ||
                            (item.tags && (item.tags.includes('security') || item.tags.includes('safety')))
                          ).length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              {data
                                .filter(item => 
                                  item.title.toLowerCase().includes('tsa') || 
                                  item.title.toLowerCase().includes('screening') || 
                                  item.title.toLowerCase().includes('security') ||
                                  item.title.toLowerCase().includes('safety') ||
                                  (item.tags && (item.tags.includes('security') || item.tags.includes('safety')))
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
                                          {getResourceTypeWithYear(item)}
                                        </Badge>
                                      </HStack>
                                      <Text noOfLines={4}>{item.content}</Text>
                                      {item.url && (
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
                          ) : (
                            // Fallback content when no security/safety information is available
                            <Box
                              p={5}
                              borderWidth="1px"
                              borderRadius="lg"
                              bg={colorMode === 'light' ? 'white' : 'gray.800'}
                              boxShadow="sm"
                            >
                              <VStack align="stretch" spacing={4}>
                                <Text>
                                  TSA screening procedures can present challenges for transgender travelers. While we don't currently 
                                  have updated information on specific screening policies, here are some general guidelines:
                                </Text>
                                <UnorderedList spacing={2} pl={4}>
                                  <ListItem>
                                    <Text fontWeight="medium">Know your rights:</Text>
                                    <Text>You have the right to opt out of body scanners and request a private screening.</Text>
                                  </ListItem>
                                  <ListItem>
                                    <Text fontWeight="medium">Binders, prosthetics, and packers:</Text>
                                    <Text>You do not have to remove these items during screening but may need to undergo additional screening.</Text>
                                  </ListItem>
                                  <ListItem>
                                    <Text fontWeight="medium">ID considerations:</Text>
                                    <Text>Be prepared for questions if your appearance doesn't match your ID photo or gender marker.</Text>
                                  </ListItem>
                                </UnorderedList>
                                <Text fontWeight="medium" mt={2}>
                                  For the most recent guidance, check the following resources:
                                </Text>
                                <HStack spacing={4} wrap="wrap">
                                  <Link href="https://transequality.org/know-your-rights/airport-security" isExternal color="blue.500">
                                    NCTE: Airport Security
                                  </Link>
                                  <Link href="https://www.tsa.gov/transgender-passengers" isExternal color="blue.500">
                                    TSA: Transgender Passengers
                                  </Link>
                                </HStack>
                              </VStack>
                            </Box>
                          )}
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    {/* DOCUMENTATION TAB */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Passport & ID Documentation</Heading>
                        <Text>
                          Essential information about identification documents, passport requirements, and gender marker changes for transgender travelers.
                        </Text>
                        
                        {/* Critical alert about outdated information */}
                        <Box
                          p={5}
                          borderWidth="1px"
                          borderRadius="lg"
                          bg={colorMode === 'light' ? 'red.50' : 'red.900'}
                          borderColor="red.300"
                          mb={4}
                        >
                          <VStack align="stretch" spacing={3}>
                            <Heading size="md">Important Update</Heading>
                            <HStack>
                              <Badge colorScheme="blue" width="fit-content">
                                U.S. Department of State
                              </Badge>
                              <Badge 
                                colorScheme="red" 
                                size="sm"
                              >
                                CRITICAL
                              </Badge>
                              <Badge>March 2025</Badge>
                            </HStack>
                            <Text>
                              U.S. policies regarding gender markers on passports have changed. The State Department is no longer 
                              issuing passports with an "X" gender marker, and all passports must now reflect the applicant's 
                              sex at birth. Previously issued X-marker passports remain valid until expiration but will not be 
                              renewed with that marker.
                            </Text>
                            <Text fontWeight="medium">
                              If you have an X marker passport issued less than one year ago, you can apply for a replacement 
                              passport with your sex assigned at birth free of charge.
                            </Text>
                          </VStack>
                        </Box>
                        
                        {/* Documentation Guidance Cards */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {data
                            .filter(item => 
                              item.title.toLowerCase().includes('passport') || 
                              item.title.toLowerCase().includes('gender marker') || 
                              item.title.toLowerCase().includes('identification') ||
                              item.title.toLowerCase().includes('document') ||
                              (item.tags && (
                                item.tags.includes('documentation') || 
                                item.tags.includes('identification') ||
                                item.tags.includes('passport')
                              ))
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
                                      {getResourceTypeWithYear(item)}
                                    </Badge>
                                  </HStack>
                                  <Text noOfLines={4}>{item.content}</Text>
                                  {item.url && (
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
                          <Heading size="sm" mb={2}>Official Documentation Resources</Heading>
                          <HStack wrap="wrap" spacing={4}>
                            <Link href="https://travel.state.gov/content/travel/en/passports/passport-help/sex-marker.html" isExternal color="blue.500">
                              State Department: Gender Marker Information
                            </Link>
                            <Link href="https://transequality.org/know-your-rights/identity-documents" isExternal color="blue.500">
                              NCTE: Identity Documents Guide
                            </Link>
                          </HStack>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    {/* SUPPORT RESOURCES TAB */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={2}>Support Resources</Heading>
                        <Text>
                          Community resources, healthcare information, and support networks for transgender travelers.
                        </Text>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          {data
                            .filter(item => 
                              getResourceType(item) === 'permanent' ||
                              (item.tags && (
                                item.tags.includes('community') || 
                                item.tags.includes('healthcare') ||
                                item.tags.includes('support')
                              )) ||
                              item.title.toLowerCase().includes('community') ||
                              item.title.toLowerCase().includes('health') ||
                              item.title.toLowerCase().includes('support')
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
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                    
                    {/* ALL INFORMATION TAB */}
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
                              <option value="scraped">Time-Sensitive Updates</option>
                              <option value="permanent">Permanent Resources</option>
                            </Select>
                            <Tooltip 
                              label="'Updated' resources contain time-sensitive information that may change with policy updates. Date indicates when content was last verified. 'Permanent resource' provides reliable reference information regardless of current policies."
                              placement="top"
                              hasArrow
                              maxWidth="300px"
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
                                      <HStack spacing={2} mb={2}>
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
                                          {getResourceTypeWithYear(item)}
                                        </Badge>
                                        {/* Add priority label in a more subtle way */}
                                        {getResourcePriority(item) <= 2 && (
                                          <Badge 
                                            colorScheme={getResourcePriority(item) === 1 ? 'red' : 'orange'}
                                            variant="outline"
                                            px={2}
                                            py={0.5}
                                            borderRadius="md"
                                          >
                                            {getResourcePriority(item) === 1 ? 'Critical' : 'Important'}
                                          </Badge>
                                        )}
                                      </HStack>
                                      <Text fontWeight="bold" fontSize="lg">{item.title}</Text>
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