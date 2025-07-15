import React from 'react';
import SearchInput from '../components/SearchInput';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import WeatherChart from '../components/WeatherChart';
import DataQualityCard from '../components/DataQualityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GeolocationLoading from '../components/GeolocationLoading';
import GeolocationError from '../components/GeolocationError';

/**
 * Weather Analytics Dashboard - Layout optimisé (≥1024px)
 * Organisation des composants météo en zones dédiées :
 * - Barre de recherche (haut, pleine largeur)
 * - Météo actuelle (gauche, 1fr)
 * - Prévisions 7 jours (centre, 2fr - zone principale)
 * - Qualité des données (droite, 1fr - compacte)
 * - Graphiques tendances (bas, pleine largeur)
 */
const GridLayout = ({
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
  return (
    <div className="grid-container">
      {/* Barre de recherche - toujours en haut */}
      <div className="search-section">
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
          {/* Météo actuelle - zone gauche */}
          <div className="weather-display">
            <WeatherDisplay data={weatherData} />
          </div>
          
          {/* Prévisions 7 jours - zone centrale principale */}
          <div className="weekly-forecast">
            <WeeklyForecast forecastData={forecastData} />
          </div>
          
          {/* Qualité des données - zone droite compacte */}
          <div className="data-quality-card">
            <DataQualityCard data={weatherData} />
          </div>
          
          {/* Graphiques/tendances - zone bas pleine largeur */}
          <div className="weather-chart-container">
            <WeatherChart 
              forecastData={forecastData} 
              currentData={weatherData} 
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GridLayout;