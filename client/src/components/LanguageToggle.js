import React from 'react';
import useTranslation, { LANGUAGES } from '../hooks/useTranslation';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useTranslation();
  
  const currentLanguage = LANGUAGES.find(lang => lang.code === language);

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      title={t('language.toggle')}
      aria-label={t('accessibility.languageToggle')}
    >
      <span className="language-flag">
        {currentLanguage?.flag}
      </span>
      <span className="language-text">
        {language.toUpperCase()}
      </span>
    </button>
  );
};

export default LanguageToggle;