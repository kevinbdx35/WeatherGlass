import { useState, useEffect, useCallback, useMemo } from 'react';
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';

const translations = {
  fr: frTranslations,
  en: enTranslations
};

const useTranslation = () => {
  const [language, setLanguage] = useState(() => {
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
    localStorage.setItem('weather-app-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
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