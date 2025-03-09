# Translations for Transport

This directory contains all translation files for the Transport application.

## Structure

- `en.json`: Base English translations (source of truth)
- `LanguageContext.tsx`: Context provider for translations
- `useTranslation.ts`: Hook for accessing translations
- Other language files (e.g., `es.json`, `fr.json`, etc.)

## Adding a New Language

To add a new language:

1. Copy the `en.json` file to a new file named with the language code (e.g., `fr.json` for French)
2. Translate all the strings in the new file
3. The language will automatically be available in the language switcher

## Key Structure

Translation keys are organized hierarchically:

```
{
  "general": {
    "siteTitle": "Transport",
    "siteDescription": "..."
  },
  "header": {
    "darkMode": "...",
    "lightMode": "..."
  },
  ...
}
```

## Usage in Components

```tsx
import { useTranslation } from '../../translations/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('general.siteTitle')}</h1>
      <p>{t('general.siteDescription')}</p>
      
      {/* With dynamic values */}
      <p>{t('search.resultsFor', { term: searchTerm })}</p>
    </div>
  );
};
```

## Supported Languages

Currently, the application supports 20 languages:

- English (en)
- Spanish (es)
- Chinese (zh)
- Hindi (hi)
- Arabic (ar)
- Bengali (bn)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- German (de)
- French (fr)
- Indonesian (id)
- Urdu (ur)
- Italian (it)
- Korean (ko)
- Turkish (tr)
- Vietnamese (vi)
- Polish (pl)
- Thai (th)
- Swahili (sw)

To add more languages, update the `supportedLanguages` array in the `LanguageContext.tsx` file. 