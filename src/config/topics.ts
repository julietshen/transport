/**
 * Topics configuration for the topic-based scraper
 */

import { Topic, TopicsConfig } from '../types/topics';

// Travel documentation topics
const travelDocTopics: Topic[] = [
  {
    id: 'passport-gender-marker',
    name: 'Passport Gender Marker Updates',
    description: 'Changes to passport policies regarding gender markers for transgender individuals',
    keywords: [
      'transgender passport',
      'gender marker passport',
      'passport gender',
      'nonbinary passport',
      'passport policy transgender',
      'X gender marker',
      'passport gender change',
      'passport gender policy'
    ],
    exclusionTerms: [
      'fiction',
      'movie',
      'film',
      'entertainment'
    ],
    category: 'identityDocuments',
    priority: 9
  },
  {
    id: 'id-document-changes',
    name: 'ID Document Policy Changes',
    description: 'Changes to policies for identification documents for transgender individuals',
    keywords: [
      'transgender ID',
      'transgender identification',
      'gender marker ID',
      'nonbinary ID',
      'driver license gender',
      'ID document transgender',
      'birth certificate gender'
    ],
    exclusionTerms: [
      'fiction',
      'game',
      'entertainment'
    ],
    category: 'identityDocuments',
    priority: 8
  }
];

// Travel restrictions topics
const travelRestrictionTopics: Topic[] = [
  {
    id: 'country-travel-bans',
    name: 'Country Travel Bans',
    description: 'Travel bans or restrictions for specific countries, regardless of gender identity',
    keywords: [
      'travel ban',
      'country ban',
      'travel restriction',
      'border closed',
      'entry prohibited',
      'travel advisory',
      'visa suspension'
    ],
    category: 'currentAlerts',
    priority: 10
  },
  {
    id: 'trans-specific-travel-restrictions',
    name: 'Trans-Specific Travel Restrictions',
    description: 'Travel restrictions or advisories specifically affecting transgender individuals',
    keywords: [
      'transgender travel warning',
      'transgender travel restriction',
      'transgender travel ban',
      'transgender travel advisory',
      'nonbinary travel warning',
      'trans traveler',
      'lgbtq travel ban',
      'transgender tourism'
    ],
    exclusionTerms: [
      'fiction',
      'novel',
      'entertainment'
    ],
    category: 'currentAlerts',
    priority: 10
  }
];

// Legal issues topics
const legalTopics: Topic[] = [
  {
    id: 'legal-rights-transportation',
    name: 'Legal Rights During Transportation',
    description: 'Legal rights and protections for transgender individuals during travel and transportation',
    keywords: [
      'transgender rights travel',
      'trans rights airport',
      'transgender rights transit',
      'nonbinary rights travel',
      'transgender passenger rights',
      'lgbtq travel rights',
      'transgender discrimination travel',
      'transgender lawsuit airport'
    ],
    exclusionTerms: [
      'fiction',
      'entertainment'
    ],
    category: 'communityResources',
    priority: 7
  },
  {
    id: 'screening-policies',
    name: 'Airport Screening Policies',
    description: 'Policies and procedures for security screening that affect transgender travelers',
    keywords: [
      'transgender screening',
      'airport screening transgender',
      'tsa transgender',
      'security screening transgender',
      'body scanner transgender',
      'pat down transgender',
      'airport security transgender'
    ],
    category: 'travelPlanning',
    priority: 8
  }
];

// Community resources topics
const communityTopics: Topic[] = [
  {
    id: 'trans-travel-guides',
    name: 'Trans Travel Guides',
    description: 'Travel guides and resources specifically created for transgender travelers',
    keywords: [
      'transgender travel guide',
      'trans travel tips',
      'transgender traveler guide',
      'transgender tourism guide',
      'nonbinary travel guide',
      'transgender travel resources',
      'transgender travel advice',
      'trans tourism'
    ],
    exclusionTerms: [
      'fiction',
      'entertainment'
    ],
    category: 'communityResources',
    priority: 6
  }
];

// Combine all topics
export const topicsConfig: TopicsConfig = {
  topics: [
    ...travelDocTopics,
    ...travelRestrictionTopics,
    ...legalTopics,
    ...communityTopics
  ],
  lastUpdated: new Date().toISOString()
}; 