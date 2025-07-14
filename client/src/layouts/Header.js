import React from 'react';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';
import useTranslation from '../hooks/useTranslation';

const Header = ({ 
  themeMode, 
  theme, 
  onThemeToggle, 
  autoRefresh, 
  showAutoRefresh = false 
}) => {
  const { t } = useTranslation();

  return (
    <header className="app-header">
      <div className="header-controls">
        <LanguageToggle />
        <ThemeToggle 
          themeMode={themeMode} 
          theme={theme} 
          onToggle={onThemeToggle} 
        />
        {showAutoRefresh && (
          <div 
            className="auto-refresh-indicator"
            title={t('search.autoRefreshActive')}
            onClick={autoRefresh}
          >
            🔄
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;