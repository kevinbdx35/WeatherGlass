import React, { useState, useEffect } from 'react';
import SearchInput from '../components/SearchInput';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import WeatherChart from '../components/WeatherChart';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GridLayout from './GridLayout';

const MainContent = ({
  // Search props
  location,
  setLocation,
  onSearchKeyPress,
  searchLoading,
  searchError,
  onLocationClick,
  locationLoading,
  isLocationSupported,
  
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
        isLocationSupported={isLocationSupported}
        weatherData={weatherData}
        forecastData={forecastData}
        loading={loading}
      />
    );
  }

  // Layout classique pour les petits écrans
  return (
    <div className="container">
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
      
      <div className="weather-content">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <WeatherDisplay data={weatherData} />
            <WeeklyForecast forecastData={forecastData} />
            <WeatherChart 
              forecastData={forecastData} 
              currentData={weatherData} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent;