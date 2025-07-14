import React, { useState } from 'react';
import LocationButton from './LocationButton';
import useTranslation from '../hooks/useTranslation';

const SearchInput = ({ 
  location, 
  setLocation, 
  onKeyPress, 
  loading, 
  error,
  onLocationClick,
  locationLoading,
  isLocationSupported
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="search">
      <div className={`search-container ${isFocused ? 'focused' : ''}`}>
        <div className="search-input-wrapper">
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyPress={onKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('search.placeholder')}
            type="text"
            disabled={loading}
            className="search-input"
          />
          {location && (
            <button
              className="clear-button"
              onClick={() => setLocation('')}
              disabled={loading}
              type="button"
            >
              ×
            </button>
          )}
        </div>
        <LocationButton
          onLocationClick={onLocationClick}
          loading={locationLoading}
          disabled={loading}
          isSupported={isLocationSupported}
        />
      </div>
      {(loading || locationLoading) && (
        <div className="search-status loading">
          <span className="status-icon">⏳</span>
          {locationLoading ? t('search.locationLoading') : t('search.searchInProgress')}
        </div>
      )}
      {error && (
        <div className="search-status error">
          <span className="status-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchInput;