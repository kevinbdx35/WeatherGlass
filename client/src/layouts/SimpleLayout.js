import React from 'react';
import SearchInput from '../components/SearchInput';
import SimpleWeatherDisplay from '../components/SimpleWeatherDisplay';
import SimpleMetricsBar from '../components/SimpleMetricsBar';
import SimpleClearButton from '../components/SimpleClearButton';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GeolocationLoading from '../components/GeolocationLoading';
import GeolocationError from '../components/GeolocationError';

/**
 * Layout simple et épuré inspiré du design screen-capture.png
 * Structure : Search | Main Weather + Clear | Metrics Bar
 */
const SimpleLayout = ({
  // Search props
  location,
  setLocation,
  onSearchKeyPress,
  searchLoading,
  searchError,
  onLocationClick,
  locationLoading,
  locationError,
  isLocationSupported,
  onRetryGeolocation,
  onSkipGeolocation,
  
  // Weather data props
  weatherData,
  loading
}) => {

  const handleClear = () => {
    setLocation('');
  };

  return (
    <div className="grid-container">
      {/* Barre de recherche centrée */}
      <div className="grid-search">
        <SearchInput
          location={location}
          setLocation={setLocation}
          onKeyPress={onSearchKeyPress}
          loading={searchLoading}
          error={searchError}
          onLocationClick={onLocationClick}
          locationLoading={locationLoading}
          isLocationSupported={isLocationSupported}
        />
      </div>
      
      {locationError ? (
        <div className="grid-loading">
          <GeolocationError 
            error={locationError}
            onRetry={onRetryGeolocation}
            onSkip={onSkipGeolocation}
          />
        </div>
      ) : locationLoading && !weatherData.name ? (
        <div className="grid-loading">
          <GeolocationLoading />
        </div>
      ) : loading ? (
        <div className="grid-loading">
          <LoadingSkeleton />
        </div>
      ) : (
        <>
          {/* Zone principale météo - Ville + Température */}
          <div className="grid-main">
            <SimpleWeatherDisplay data={weatherData} />
          </div>
          
          {/* Bouton Clear à droite */}
          <div className="grid-clear">
            <SimpleClearButton onClear={handleClear} />
          </div>
          
          {/* Barre de métriques en bas */}
          <div className="grid-metrics">
            <SimpleMetricsBar data={weatherData} />
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleLayout;