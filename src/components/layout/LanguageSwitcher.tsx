import { Select, Box } from '@chakra-ui/react';
import { useTranslation } from '../../translations/useTranslation';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, languages } = useTranslation();

  return (
    <Box>
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        size="sm"
        aria-label="Select language"
        variant="filled"
        width="auto"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </Select>
    </Box>
  );
}; 