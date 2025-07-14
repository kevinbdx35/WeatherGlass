import React from 'react';
import useTranslation from '../hooks/useTranslation';

/**
 * Composant d'affichage d'erreur de géolocalisation
 * Propose un fallback vers la recherche manuelle
 */
const GeolocationError = ({ error, onRetry, onSkip }) => {
  const { t } = useTranslation();

  const getErrorIcon = () => {
    if (error.includes('denied') || error.includes('refusé')) return '🚫';
    if (error.includes('timeout') || error.includes('délai')) return '⏱️';
    return '⚠️';
  };

  return (
    <div className="geolocation-error">
      <div className="geolocation-error-content">
        <div className="error-icon">
          {getErrorIcon()}
        </div>
        <div className="error-text">
          <h3 className="error-title">
            {t('search.geolocation.errorTitle')}
          </h3>
          <p className="error-message">
            {error}
          </p>
          <p className="error-subtitle">
            {t('search.geolocation.manualSearch')}
          </p>
        </div>
        <div className="error-actions">
          <button 
            className="retry-button"
            onClick={onRetry}
            type="button"
          >
            <span className="button-icon">🔄</span>
            {t('search.geolocation.retry')}
          </button>
          <button 
            className="skip-button"
            onClick={onSkip}
            type="button"
          >
            <span className="button-icon">🔍</span>
            {t('search.geolocation.manualMode')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeolocationError;