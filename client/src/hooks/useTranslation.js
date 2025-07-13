import { useState, useEffect, useCallback, useMemo } from 'react';
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import deTranslations from '../locales/de.json';
import itTranslations from '../locales/it.json';

const translations = {
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  de: deTranslations,
  it: itTranslations
};

// Configuration des langues disponibles
export const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

const useTranslation = () => {
  const [language, setLanguage] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'en'; // Default for SSR
    }
    
    // Récupérer la langue sauvegardée ou détecter la langue du navigateur
    const savedLanguage = localStorage.getItem('weather-app-language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // Détecter la langue du navigateur
    const browserLanguage = navigator.language.split('-')[0];
    return translations[browserLanguage] ? browserLanguage : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-app-language', language);
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => {
      const currentIndex = LANGUAGES.findIndex(lang => lang.code === prevLang);
      const nextIndex = (currentIndex + 1) % LANGUAGES.length;
      return LANGUAGES[nextIndex].code;
    });
  }, []);

  const t = useCallback((key, interpolations = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback vers l'anglais si la clé n'existe pas
        value = translations.en;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            console.warn(`Translation key "${key}" not found`);
            return key; // Retourner la clé si la traduction n'existe pas
          }
        }
        break;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string`);
      return key;
    }
    
    // Interpolation simple
    let result = value;
    Object.keys(interpolations).forEach(interpolationKey => {
      const placeholder = `{{${interpolationKey}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), interpolations[interpolationKey]);
    });
    
    return result;
  }, [language]);

  const currentTranslations = useMemo(() => translations[language], [language]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translations: currentTranslations,
    isEnglish: language === 'en',
    isFrench: language === 'fr'
  };
};

export default useTranslation;