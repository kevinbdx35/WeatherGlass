import React, { useState, useEffect } from 'react';
import GridLayout from './GridLayout';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import SearchInput from '../components/SearchInput';
import LocationButton from '../components/LocationButton';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GeolocationLoading from '../components/GeolocationLoading';
import GeolocationError from '../components/GeolocationError';

const MainContent = ({
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
  forecastData,
  loading
}) => {
  const [useGridLayout, setUseGridLayout] = useState(false);

  // Détection de la taille d'écran pour activer le layout en grille
  useEffect(() => {
    const checkScreenSize = () => {
      setUseGridLayout(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Utiliser le layout en grille pour les grands écrans
  if (useGridLayout) {
    return (
      <GridLayout
        location={location}
        setLocation={setLocation}
        onSearchKeyPress={onSearchKeyPress}
        searchLoading={searchLoading}
        searchError={searchError}
        onLocationClick={onLocationClick}
        locationLoading={locationLoading}
        locationError={locationError}
        isLocationSupported={isLocationSupported}
        onRetryGeolocation={onRetryGeolocation}
        onSkipGeolocation={onSkipGeolocation}
        weatherData={weatherData}
        forecastData={forecastData}
        loading={loading}
      />
    );
  }

  // Layout mobile simple
  return (
    <div className="mobile-layout">
      {/* Section de recherche */}
      <div className="search-section">
        {!isLocationSupported ? (
          <GeolocationError
            onRetry={onRetryGeolocation}
            onSkip={onSkipGeolocation}
          />
        ) : locationLoading ? (
          <GeolocationLoading />
        ) : (
          <>
            <SearchInput
              location={location}
              setLocation={setLocation}
              onKeyPress={onSearchKeyPress}
              loading={searchLoading}
              error={searchError}
            />
            <LocationButton
              onClick={onLocationClick}
              loading={locationLoading}
              error={locationError}
            />
          </>
        )}
      </div>

      {/* Contenu météo */}
      {loading ? (
        <LoadingSkeleton />
      ) : weatherData ? (
        <>
          <WeatherDisplay data={weatherData} />
          {forecastData && <WeeklyForecast data={forecastData} />}
        </>
      ) : null}
    </div>
  );
};

export default MainContent;