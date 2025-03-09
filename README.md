# Trans Travel Info Hub

A comprehensive information hub for transgender travelers, automatically aggregating and displaying important travel-related information from various authoritative sources.

## Features

- Automatic scraping of official travel resources
- Real-time updates from multiple sources
- Responsive, accessible design
- Dark/light mode support
- Mobile-friendly interface

## Sources

The hub currently aggregates information from:
- U.S. State Department (Passport Gender Marker Information)
- Garden State Equality (Travel Advisories)
- Lambda Legal (Travel Rights Information)

## Technical Stack

- Next.js for static site generation
- React for UI components
- Chakra UI for accessible, responsive design
- Puppeteer & Cheerio for web scraping
- TypeScript for type safety
- GitHub Pages for hosting

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trans-travel-hub.git
cd trans-travel-hub
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build and deploy:
```bash
npm run deploy
```

## Updating Data

The data is automatically updated when running the build process. To manually update the data:

```bash
npm run scrape
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License