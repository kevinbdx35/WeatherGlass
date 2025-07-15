import React, { useEffect, useState } from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Écran de chargement principal de l'application
 * Expérience utilisateur moderne avec animations fluides
 */
const AppLoadingScreen = ({ loadingStep = 'initializing' }) => {
  const { t } = useTranslation();
  const [dotCount, setDotCount] = useState(0);

  // Animation des points de chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 'initializing':
        return t('loading.initializing', 'Initialisation de WeatherGlass');
      case 'location':
        return t('loading.location', 'Détection de votre position');
      case 'weather':
        return t('loading.weather', 'Récupération des données météo');
      case 'forecast':
        return t('loading.forecast', 'Chargement des prévisions');
      case 'background':
        return t('loading.background', 'Préparation de l\'interface');
      default:
        return t('loading.default', 'Chargement en cours');
    }
  };

  const getLoadingIcon = () => {
    switch (loadingStep) {
      case 'initializing':
        return '🌤️';
      case 'location':
        return '📍';
      case 'weather':
        return '🌡️';
      case 'forecast':
        return '📅';
      case 'background':
        return '🎨';
      default:
        return '⏳';
    }
  };

  return (
    <div className="app-loading-screen">
      <div className="loading-container">
        {/* Logo animé */}
        <div className="loading-logo">
          <div className="logo-icon">
            {getLoadingIcon()}
          </div>
          <div className="logo-text">
            <h1 className="app-name">WeatherGlass</h1>
            <p className="app-tagline">{t('loading.tagline', 'Votre météo en temps réel')}</p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill" data-step={loadingStep}></div>
          </div>
          <div className="progress-steps">
            <div className={`step ${loadingStep === 'initializing' ? 'active' : ''}`}>
              <div className="step-dot"></div>
            </div>
            <div className={`step ${loadingStep === 'location' ? 'active' : ''}`}>
              <div className="step-dot"></div>
            </div>
            <div className={`step ${loadingStep === 'weather' ? 'active' : ''}`}>
              <div className="step-dot"></div>
            </div>
            <div className={`step ${loadingStep === 'forecast' ? 'active' : ''}`}>
              <div className="step-dot"></div>
            </div>
            <div className={`step ${loadingStep === 'background' ? 'active' : ''}`}>
              <div className="step-dot"></div>
            </div>
          </div>
        </div>

        {/* Message de chargement */}
        <div className="loading-message">
          <p className="loading-text">
            {getLoadingMessage()}
            <span className="loading-dots">
              {'.'.repeat(dotCount)}
            </span>
          </p>
        </div>

        {/* Animation de particules météo */}
        <div className="weather-particles">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                '--delay': `${i * 0.3}s`,
                '--x': `${Math.random() * 100}%`,
                '--duration': `${2 + Math.random() * 2}s`
              }}
            >
              {['☀️', '🌤️', '⛅', '🌧️', '❄️', '🌈'][i]}
            </div>
          ))}
        </div>

        {/* Indication de patience */}
        <div className="loading-hint">
          <p className="hint-text">
            {t('loading.hint', 'Préparation de votre expérience météo personnalisée')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingScreen;