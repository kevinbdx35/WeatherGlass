import React from 'react';
import SearchInput from '../components/SearchInput';
import WeatherDisplay from '../components/WeatherDisplay';
import WeeklyForecast from '../components/WeeklyForecast';
import WeatherChart from '../components/WeatherChart';
import LoadingSkeleton from '../components/LoadingSkeleton';

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