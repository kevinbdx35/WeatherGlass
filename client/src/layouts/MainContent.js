import React, { useState, useEffect } from 'react';
import ScreenCaptureLayout from './ScreenCaptureLayout';

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

  // Utiliser le layout screen capture pour tous les écrans
  return (
    <ScreenCaptureLayout
      weatherData={weatherData}
    />
  );
};

export default MainContent;