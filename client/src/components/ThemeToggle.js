import React from 'react';
import useTranslation from '../hooks/useTranslation';

const ThemeToggle = ({ themeMode, theme, onToggle }) => {
  const { t } = useTranslation();
  
  // Déterminer le titre et l'icône selon le mode
  const getThemeInfo = () => {
    if (themeMode === 'auto') {
      return {
        title: t('theme.autoMode', `Auto (${theme === 'dark' ? 'Dark' : 'Light'})`),
        icon: (
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="M4.93 4.93l1.41 1.41"/>
            <path d="M17.66 17.66l1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="M6.34 17.66l-1.41 1.41"/>
            <path d="M19.07 4.93l-1.41 1.41"/>
            <path d="M12 8a4 4 0 0 0 0 8"/>
          </svg>
        )
      };
    } else if (themeMode === 'light') {
      return {
        title: t('theme.lightMode', 'Light Mode'),
        icon: (
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )
      };
    } else {
      return {
        title: t('theme.darkMode', 'Dark Mode'),
        icon: (
          <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )
      };
    }
  };

  const themeInfo = getThemeInfo();
  
  return (
    <button
      className={`theme-toggle ${themeMode === 'auto' ? 'auto-mode' : ''}`}
      onClick={onToggle}
      title={themeInfo.title}
      aria-label={t('accessibility.themeToggle')}
    >
      {themeInfo.icon}
    </button>
  );
};

export default ThemeToggle;