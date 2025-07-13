import React from 'react';
import LocationButton from './LocationButton';
import useTranslation from '../hooks/useTranslation';

const SearchInput = React.memo(({ 
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

  return (
    <div className="search">
      <div className="search-container">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={onKeyPress}
          placeholder={t('search.placeholder')}
          type="text"
          disabled={loading}
          className="search-input"
        />
        <LocationButton
          onLocationClick={onLocationClick}
          loading={locationLoading}
          disabled={loading}
          isSupported={isLocationSupported}
        />
      </div>
      {(loading || locationLoading) && (
        <p className="loading">
          {locationLoading ? t('search.locationLoading') : t('search.searchInProgress')}
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;