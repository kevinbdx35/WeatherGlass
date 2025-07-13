import React from 'react';
import useTranslation from '../hooks/useTranslation';

const LocationButton = React.memo(({ 
  onLocationClick, 
  loading, 
  disabled,
  isSupported 
}) => {
  const { t } = useTranslation();
  
  if (!isSupported) return null;

  return (
    <button
      className={`location-btn ${loading ? 'loading' : ''}`}
      onClick={onLocationClick}
      disabled={disabled || loading}
      title={t('search.locationButton')}
      aria-label={t('accessibility.locationButton')}
    >
      <svg 
        className="location-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
        <path d="M12 8L12 16"/>
        <path d="M8 12L16 12"/>
      </svg>
      {loading && <span className="loading-text">{t('search.locationLoading')}</span>}
    </button>
  );
});

LocationButton.displayName = 'LocationButton';

export default LocationButton;