import React from 'react';
import useTranslation from '../hooks/useTranslation';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      title={t('language.toggle')}
      aria-label={t('accessibility.languageToggle')}
    >
      <span className="language-text">
        {language.toUpperCase()}
      </span>
      <svg 
        className="language-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </button>
  );
};

export default LanguageToggle;