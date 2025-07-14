import React from 'react';
import SearchInput from '../components/SearchInput';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import WeatherChart from '../components/WeatherChart';
import DataQualityCard from '../components/DataQualityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const GridLayout = ({
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
  return (
    <div className="grid-container">
      {/* Barre de recherche - toujours en haut */}
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
      
      {loading ? (
        <div className="grid-loading">
          <LoadingSkeleton />
        </div>
      ) : (
        <>
          {/* Météo actuelle - zone principale */}
          <div className="grid-current-weather">
            <WeatherDisplay data={weatherData} />
          </div>
          
          {/* Prévisions 7 jours - zone secondaire */}
          <div className="grid-forecast">
            <WeeklyForecast forecastData={forecastData} />
          </div>
          
          {/* Graphiques - zone tertiaire */}
          <div className="grid-charts">
            <WeatherChart 
              forecastData={forecastData} 
              currentData={weatherData} 
            />
          </div>
          
          {/* Carte de qualité des données */}
          <div className="grid-quality">
            <DataQualityCard data={weatherData} />
          </div>
        </>
      )}
    </div>
  );
};

export default GridLayout;