import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import SearchInput from './components/SearchInput';
import WeatherDisplay from './components/WeatherDisplay';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import LoadingSkeleton from './components/LoadingSkeleton';
import BackgroundParticles from './components/BackgroundParticles';
import DynamicBackground from './components/DynamicBackground';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import WeeklyForecast from './components/WeeklyForecast';
import WeatherChart from './components/WeatherChart';
import WeatherCache from './utils/weatherCache';
import useGeolocation from './hooks/useGeolocation';
import useTheme from './hooks/useTheme';
import useWeatherBackground from './hooks/useWeatherBackground';
import useTranslation from './hooks/useTranslation';

function App() {
  const [data, setData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cache = useRef(new WeatherCache());
  const debounceTimer = useRef(null);
  
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useTranslation();
  const { 
    location: geoLocation, 
    loading: geoLoading, 
    error: geoError, 
    getCurrentLocation,
    isSupported: isGeoSupported 
  } = useGeolocation(t);
  
  const {
    currentBackground,
    updateBackground,
    loading: backgroundLoading
  } = useWeatherBackground();

  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl)
      ]);
      
      const weatherData = currentResponse.data;
      const forecast = forecastResponse.data;
      
      // Process forecast data to get daily forecasts
      const dailyForecasts = processForecastData(forecast.list);
      
      cache.current.set(`${lat},${lon}`, weatherData);
      cache.current.set(`forecast_${lat},${lon}`, dailyForecasts);
      
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(t('search.errors.cityNotFound'));
      } else if (err.response?.status === 401) {
        setError(t('search.errors.authError'));
      } else if (err.code === 'NETWORK_ERROR') {
        setError(t('search.errors.networkError'));
      } else {
        setError(t('common.error'));
      }
      setData({});
      setForecastData([]);
    }
  }, [language, t]);

  const fetchWeatherData = useCallback(async (cityName) => {
    const cachedData = cache.current.get(cityName);
    const cachedForecast = cache.current.get(`forecast_${cityName}`);
    
    if (cachedData && cachedForecast) {
      setData(cachedData);
      setForecastData(cachedForecast);
      setError('');
      return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl)
      ]);
      
      const weatherData = currentResponse.data;
      const forecast = forecastResponse.data;
      
      // Process forecast data to get daily forecasts
      const dailyForecasts = processForecastData(forecast.list);
      
      cache.current.set(cityName, weatherData);
      cache.current.set(`forecast_${cityName}`, dailyForecasts);
      
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(t('search.errors.cityNotFound'));
      } else if (err.response?.status === 401) {
        setError(t('search.errors.authError'));
      } else if (err.code === 'NETWORK_ERROR') {
        setError(t('search.errors.networkError'));
      } else {
        setError(t('common.error'));
      }
      setData({});
      setForecastData([]);
    }
  }, [language, t]);

  // Utility function to process forecast data
  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: date,
          temps: [],
          conditions: [],
          humidity: [],
          wind: [],
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          main: item.weather[0].main
        };
      }
      
      dailyData[dayKey].temps.push(item.main.temp);
      dailyData[dayKey].conditions.push(item.weather[0]);
      dailyData[dayKey].humidity.push(item.main.humidity);
      dailyData[dayKey].wind.push(item.wind.speed);
    });
    
    // Convert to array and calculate daily averages
    return Object.values(dailyData).slice(0, 7).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length),
      icon: day.icon,
      description: day.description,
      main: day.main
    }));
  };

  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      if (!location.trim()) {
        setError(t('search.errors.emptyInput'));
        return;
      }

      setLoading(true);
      setError('');
      
      fetchWeatherData(location).finally(() => {
        setLoading(false);
        setLocation('');
      });
    }
  };

  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (geoLocation) {
      setLoading(true);
      fetchWeatherByCoords(geoLocation.latitude, geoLocation.longitude)
        .finally(() => setLoading(false));
    }
  }, [geoLocation, fetchWeatherByCoords]);

  useEffect(() => {
    if (geoError) {
      setError(geoError);
    }
  }, [geoError]);

  // Mettre à jour le background quand les données météo changent
  useEffect(() => {
    if (data.weather && data.weather[0] && data.name) {
      const weatherCondition = data.weather[0].main;
      const city = data.name;
      updateBackground(weatherCondition, city);
    }
  }, [data.weather, data.name, updateBackground]);

  return (
    <div className="app">
      <DynamicBackground
        currentBackground={currentBackground}
        attribution={true}
      />
      <BackgroundParticles theme={theme} />
      
      <OfflineIndicator />
      <InstallPrompt />
      
      <div className="app-header">
        <div className="header-controls">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
      
      <SearchInput
        location={location}
        setLocation={setLocation}
        onKeyPress={searchLocation}
        loading={loading}
        error={error}
        onLocationClick={handleLocationClick}
        locationLoading={geoLoading}
        isLocationSupported={isGeoSupported}
      />
      
      <div className="container">
        {(loading || geoLoading) ? (
          <LoadingSkeleton />
        ) : (
          <>
            <WeatherDisplay data={data} />
            <WeeklyForecast forecastData={forecastData} />
            <WeatherChart forecastData={forecastData} currentData={data} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
