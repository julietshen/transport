# Transgender Travel Information Hub

A comprehensive information hub for transgender travelers that automatically scrapes and aggregates the latest travel advisories, passport information, and safety resources during times of policy change.

## Features

- 🔄 Automatically scrapes data from government and advocacy websites
- 📱 Responsive, accessible interface for mobile and desktop
- 🔍 Search and filter capabilities to find specific information
- 📊 Categorized information (Documentation, Safety, Resources)
- 🌙 Light/dark mode for comfortable viewing
- 🔄 Daily automated updates through GitHub Actions

## Data Sources

This hub aggregates information from various sources, including:

- U.S. Department of State (Passport gender marker information)
- Garden State Equality (Travel advisories)
- Lambda Legal (TGNC rights checklist)
- Additional advocacy organizations

## Technical Overview

### Data Scraping Pipeline

The data scraping pipeline consists of:

1. **Specialized Scrapers**: Each data source has a dedicated scraper that handles the specific structure of that website.
2. **Fallback Content**: If anti-bot protections prevent scraping, the system falls back to pre-saved content from 2025.
3. **Data Processing**: Raw scraped data is processed, categorized, and merged from different sources.
4. **Daily Updates**: GitHub Actions runs the scraper daily to ensure the most current information.

### Frontend

The frontend is built with:

- Next.js for React framework
- Chakra UI for accessible components
- TypeScript for type safety

### Deployment

The site is automatically deployed to GitHub Pages through a GitHub Actions workflow.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/transport.git
cd transport

# Install dependencies
npm install
```

### Development

```bash
# Run the scraper to fetch current data
npm run scrape

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
# Run the full build process (scrape + build)
npm run deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the advocacy organizations that provide crucial information for transgender travelers
- Built with support from the transgender and non-binary community