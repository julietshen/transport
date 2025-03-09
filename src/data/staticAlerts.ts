import { StaticAlert, ResourceCategory } from '../types/resources';

/**
 * Static alerts that will always be displayed in specific tabs
 * regardless of scraped content
 */
const staticAlerts: Record<ResourceCategory, StaticAlert[]> = {
  currentAlerts: [
    {
      status: 'warning',
      text: 'PASSPORT UPDATE (March 2025): The U.S. State Department is currently no longer issuing new passports with X gender markers. Previously issued X-marker passports remain valid until their expiration date. Some travelers have reported that their X gender marker passport renewals are being processed with their sex assigned at birth. For guidance, consider contacting the National Center for Transgender Equality or Lambda Legal for assistance.'
    }
  ],
  travelPlanning: [
    {
      status: 'info',
      text: 'DOMESTIC TRAVEL NOTE (March 2025): State laws affecting transgender and nonbinary individuals vary widely across the United States. This site focuses primarily on international travel and documentation concerns and does not provide comprehensive information about interstate travel. For the most current information about specific state laws, please consult organizations specializing in LGBTQ+ legal advocacy.'
    }
  ],
  identityDocuments: [
    {
      status: 'warning',
      text: 'IDENTITY DOCUMENT ALERT (March 2025): Several U.S. states have recently implemented changes to their ID and driver\'s license policies that may affect transgender and nonbinary individuals. Additionally, federal agencies may have altered documentation requirements for gender marker changes. Please verify the current requirements in your state before applying for updated documents or traveling. For up-to-date guidance, consider contacting advocacy organizations like the National Center for Transgender Equality or Lambda Legal.'
    }
  ],
  communityResources: [],
  allResources: []
};

export default staticAlerts; 