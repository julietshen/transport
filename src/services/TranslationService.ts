/**
 * TranslationService.ts
 * Service for handling translation operations
 */

/**
 * Interface for TranslationService methods
 */
export interface ITranslationService {
  getTranslations(locale: string): Promise<Record<string, string>>;
  getSupportedLocales(): Promise<string[]>;
  getTextDirection(locale: string): 'ltr' | 'rtl';
}

/**
 * Service implementation for translation operations
 */
export class TranslationService implements ITranslationService {
  /**
   * RTL (right-to-left) locales
   */
  private rtlLocales = ['ar', 'fa', 'he', 'ur'];
  
  /**
   * Gets translations for a specific locale
   * @param locale Locale code (e.g., 'en', 'es')
   * @returns Promise resolving to a record of translation keys and values
   */
  async getTranslations(locale: string): Promise<Record<string, string>> {
    try {
      // Use dynamic import to load translations on demand
      const translations = await import(`../translations/${locale}.json`);
      return translations.default || {};
    } catch (error) {
      console.error(`Error loading translations for locale ${locale}:`, error);
      
      // Fallback to English if translations not found
      try {
        const fallbackTranslations = await import('../translations/en.json');
        return fallbackTranslations.default || {};
      } catch (fallbackError) {
        console.error('Error loading fallback translations:', fallbackError);
        return {};
      }
    }
  }
  
  /**
   * Gets list of supported locales from the translations directory
   * @returns Promise resolving to an array of locale codes
   */
  async getSupportedLocales(): Promise<string[]> {
    try {
      // In a browser environment, we can't read the directory
      // So we hardcode the supported locales
      return [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'ru',
        'zh-CN',
        'zh-TW',
        'ja',
        'ko',
        'ar',
        'hi',
        'bn'
      ];
    } catch (error) {
      console.error('Error getting supported locales:', error);
      return ['en']; // Fallback to English only
    }
  }
  
  /**
   * Gets text direction for a locale
   * @param locale Locale code
   * @returns 'rtl' for right-to-left languages, 'ltr' otherwise
   */
  getTextDirection(locale: string): 'ltr' | 'rtl' {
    return this.rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  }
} 