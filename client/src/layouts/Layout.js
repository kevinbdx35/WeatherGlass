import React from 'react';
import Header from './Header';
import Footer from '../components/Footer';
import DynamicBackground from '../components/DynamicBackground';
import BackgroundParticles from '../components/BackgroundParticles';
import OfflineIndicator from '../components/OfflineIndicator';
import InstallPrompt from '../components/InstallPrompt';
import AutoThemeIndicator from '../components/AutoThemeIndicator';

const Layout = ({ 
  children, 
  theme, 
  themeMode, 
  onThemeToggle,
  currentBackground,
  autoRefresh,
  showAutoRefresh = false
}) => {
  return (
    <div className="app">
      <DynamicBackground currentBackground={currentBackground} />
      <BackgroundParticles theme={theme} />
      
      <OfflineIndicator />
      <InstallPrompt />
      <AutoThemeIndicator themeMode={themeMode} theme={theme} />
      
      <Header 
        themeMode={themeMode}
        theme={theme}
        onThemeToggle={onThemeToggle}
        autoRefresh={autoRefresh}
        showAutoRefresh={showAutoRefresh}
      />
      
      <main className="main-content">
        {children}
      </main>
      
      <Footer currentBackground={currentBackground} />
    </div>
  );
};

export default Layout;