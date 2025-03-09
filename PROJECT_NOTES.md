# Transport Project Notes

## Important Commands

### Free up port 3000 and run the development server
```bash
# On macOS/Linux:
kill $(lsof -t -i:3000) 2>/dev/null || true && npm run dev

# On Windows:
# FOR /F "tokens=5" %P IN ('netstat -ano | findstr :3000') DO (taskkill /F /PID %P) & npm run dev
```

## Project Structure
- `src/components/` - UI components
  - `layout/` - Layout components (Header, ErrorAlert, etc.)
  - `resources/` - Resource-specific components (SearchFilters, ResourceCard)
- `src/utils/resources/` - Resource utilities
  - `filters.ts` - Functions for filtering and sorting resources
  - `formatters.ts` - Functions for formatting data display
  - `dataFetcher.ts` - Functions for fetching resource data
  - `useResources.ts` - Custom hook for managing resources state
- `src/types/` - TypeScript type definitions
  - `resources.ts` - Resource-related types
- `public/` - Static assets including `scraped-data.json`

## Optimization Notes
See `OPTIMIZATION.md` for details on how the codebase was optimized for modularity and maintainability.

## Common Issues

### Port 3000 already in use
If port 3000 is already in use, you can free it up using the command at the top of this file.

### UI Icons
The project uses simple emoji icons rather than importing icon packages to keep dependencies minimal.

## Recent Changes and Feedback (Last Updated: March 2025)

### Content Organization and Tab Structure

1. **Tab Naming Correction**
   - Renamed "Legal Resources" tab back to its original name "Community Resources"
   - ⚠️ NOTE: Never change tab names or major UI structures without explicit approval
   - Main tabs structure should remain: Current Alerts, Travel Planning, Documentation, Community Resources, All Resources

2. **Content Placement Adjustments**
   - Moved Marco Rubio visa ban news story to Current Alerts (from Community Resources)
   - Moved Germany travel advisory for transgender people to Current Alerts
   - Removed ACLU workplace discrimination content as it's not relevant to the site's purpose
   - Updated filtering logic to ensure proper content categorization
   - Improved exclusion filters to prevent inappropriate content placement

3. **Content Filtering Improvements (Latest Update)**
   - Ensured visa-related alerts from Erin In The Morning and other news sites are properly displayed in the Travel Planning tab
   - Removed TSA precheck information as it's not relevant to the site's specific focus
   - Excluded State Department international travel notices not specific to trans/nonbinary travelers
   - Removed STEP (Smart Traveler Enrollment Program) program information as it's not advisable given the site's focus on trans protections
   - Updated filtering logic with better inclusion/exclusion criteria for more relevant content presentation

4. **Content Organization Improvements (Latest)**
   - Added static alerts to ensure critical information is always displayed
   - Simplified content filtering with direct, readable conditions for each tab
   - Applied consistent exclusion rules across all tabs 
   - Renamed "Documentation" tab to "Identity documents" to better reflect its purpose
   - Added factual domestic travel information without making unverified claims
   - Improved readability of filtering code for easier future maintenance

### Visual Design and Content Improvements

1. **Reduced Visual Clutter**
   - Reorganized alerts to reduce overwhelming the user
   - Kept only one main alert in the Current Alerts tab
   - Moved other alerts to their appropriate tabs (Documentation, Travel Planning)
   - Converted some alerts to cards for better visual hierarchy
   - Improved resource card labels to use more appropriate, less sensationalist terminology
   - Redesigned resource cards with cleaner badge styling and better information hierarchy
   - Fixed date formatting in resource cards to avoid redundant "Updated: Published:" text

2. **Language and Tone Refinements**
   - Removed "URGENT" prefix from resource titles (The Advocate and Erin in the Morning articles)
   - Applied more measured terminology throughout the application
   - Reserved words like "critical" and "urgent" only for truly time-sensitive matters
   - Updated filtering logic to avoid over-emphasizing alarmist terminology
   - Replaced all-caps labels (CRITICAL, IMPORTANT, INFO) with more descriptive, contextual labels
   - Improved the badge system to better categorize resources by type (Advisory, Documentation, Legal, Safety)

3. **Resource References**
   - Added ACLU transgender passport resource: https://www.aclu.org/transpassports2025
   - Replaced recommendations to "check with the State Department" with advice to contact advocacy organizations instead
   - Suggested contacting NCTE, Lambda Legal, or Transgender Law Center for guidance on passport issues

### Technical Improvements

1. **i18n Implementation Issues**
   - Removed problematic internationalization (i18n) files and references
   - Fixed errors related to missing translation files
   - Addressed compilation issues in the Header and SearchFilters components
   - Fixed warnings in next.config.js related to i18n.localeDetection

2. **Resource Filtering Logic**
   - Refined resource prioritization in current alerts section
   - Updated filtering criteria for Documentation tab to ensure passport issues appear appropriately
   - Enhanced support for displaying relevant information in appropriate tabs

## Next Steps and Pending Items

1. **Performance Optimization**
   - Consider further optimizations for resource loading and filtering

2. **Content Updates**
   - Continue monitoring for critical updates regarding passport and visa policies
   - Ensure all alerts remain current and accurate

3. **Technical Debt**
   - Address any remaining i18n references in other components
   - Fix syntax errors in index.tsx if they persist

## Localization Implementation (Added March 2025)

A simple, non-invasive localization system has been implemented following KISS principles:

1. **Translation System**
   - Added support for 20 languages (top spoken languages worldwide)
   - Created a simple React Context for language management
   - Implemented a useTranslation hook for easy access in components
   - Language preference saved in browser localStorage

2. **Translation Files**
   - Base language: English (en.json)
   - Spanish translation included as an example (es.json)
   - Translation files located in `src/translations/`
   - Documentation on adding new languages in `src/translations/README.md`

3. **UI Components**
   - Added LanguageSwitcher component in the Header
   - Updated UI components to use translated text
   - Supports string interpolation for dynamic content

4. **Affected Files**
   - `_app.tsx`: Added LanguageProvider wrapper
   - `Header.tsx`: Added LanguageSwitcher and translated text
   - `SearchFilters.tsx`: Translated search interface
   - `ResourceCard.tsx`: Translated resource presentation

5. **Adding New Translations**
   - Create a new JSON file in `src/translations/` named with language code
   - Copy structure from en.json and translate values
   - The language will be automatically available in the switcher 