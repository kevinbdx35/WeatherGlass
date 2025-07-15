import React from 'react';
import SearchInput from '../components/SearchInput';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import WeatherChart from '../components/WeatherChart';
import WeatherDetailsCard from '../components/WeatherDetailsCard';
import DataQualityCard from '../components/DataQualityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GeolocationLoading from '../components/GeolocationLoading';
import GeolocationError from '../components/GeolocationError';

/**
 * Dashboard 2 Colonnes - Layout optimisé (≥1024px)
 * Organisation des composants météo en deux colonnes :
 * - Barre de recherche (haut, pleine largeur)
 * - Colonne gauche : Carte principale + Prévisions 7 jours
 * - Colonne droite : Détails météo + Qualité données + Graphiques
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
          {/* Colonne gauche - Carte principale météo */}
          <div className="weather-display">
            <WeatherDisplay data={weatherData} />
          </div>
          
          {/* Colonne gauche - Prévisions 7 jours */}
          <div className="weekly-forecast">
            <WeeklyForecast forecastData={forecastData} />
          </div>
          
          {/* Colonne droite - Détails météo */}
          <div className="weather-details-card">
            <WeatherDetailsCard data={weatherData} />
          </div>
          
          {/* Colonne droite - Qualité des données */}
          <div className="data-quality-card">
            <DataQualityCard data={weatherData} />
          </div>
          
          {/* Colonne droite - Graphiques prévisions */}
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