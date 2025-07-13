import React from 'react';
import useTranslation from '../hooks/useTranslation';

const AutoThemeIndicator = ({ themeMode, theme }) => {
  const { t } = useTranslation();
  
  // Ne s'affiche que si le mode auto est activé
  if (themeMode !== 'auto') {
    return null;
  }

  const currentHour = new Date().getHours();
  const isDarkPeriod = currentHour >= 19 || currentHour < 7;
  
  return (
    <div className="auto-theme-indicator">
      <div className="indicator-icon">
        {isDarkPeriod ? '🌙' : '☀️'}
      </div>
      <div className="indicator-text">
        <span className="mode-label">{t('theme.autoMode', 'Auto')}</span>
        <span className="current-theme">
          {theme === 'dark' ? t('theme.darkMode', 'Dark') : t('theme.lightMode', 'Light')}
        </span>
      </div>
    </div>
  );
};

export default AutoThemeIndicator;