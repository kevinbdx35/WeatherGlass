import React, { useState, useEffect } from 'react';
import SimpleLayout from './SimpleLayout';

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

  // Utiliser le layout simple pour les grands écrans
  if (useGridLayout) {
    return (
      <SimpleLayout
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
        loading={loading}
      />
    );
  }

  // Layout simple pour les petits écrans aussi
  return (
    <SimpleLayout
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
      loading={loading}
    />
  );
};

export default MainContent;