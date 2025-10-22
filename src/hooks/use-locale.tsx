'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useSettings } from '@/firebase/use-settings';

// Define the shape of your translation files
type Translations = {
  [key: string]: string | Translations;
};

interface LocaleContextState {
  locale: string;
  translations: Translations;
  t: (key: string,
    options?: { [key: string]: string | number }
  ) => string;
  isLocaleLoading: boolean;
}

const LocaleContext = createContext<LocaleContextState | undefined>(undefined);

// Helper function to get nested keys
const getNested = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const { settings, isSettingsLoading } = useSettings();
  const [translations, setTranslations] = useState<Translations>({});
  const [isLocaleLoading, setIsLocaleLoading] = useState(true);

  useEffect(() => {
    if (isSettingsLoading) return;

    const loadTranslations = async () => {
      setIsLocaleLoading(true);
      try {
        const langModule = await import(`@/locales/${settings.language}.json`);
        setTranslations(langModule.default);
      } catch (error) {
        console.error(`Could not load locale: ${settings.language}`, error);
        // Fallback to English
        const langModule = await import(`@/locales/en-US.json`);
        setTranslations(langModule.default);
      } finally {
        setIsLocaleLoading(false);
      }
    };

    loadTranslations();
  }, [settings.language, isSettingsLoading]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
      let translation = getNested(translations, key);
  
      if (translation === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
  
      if (options) {
        Object.keys(options).forEach(optKey => {
            if(typeof translation === 'string') {
                translation = translation.replace(`{{${optKey}}}`, String(options[optKey]));
            }
        });
      }
  
      return translation as string;
    },
    [translations]
  );

  const value = {
    locale: settings.language,
    translations,
    t,
    isLocaleLoading,
  };

  return (
    <LocaleContext.Provider value={value}>
      {!isLocaleLoading ? children : <div className="flex h-screen w-full items-center justify-center">Loading locale...</div>}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextState => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
