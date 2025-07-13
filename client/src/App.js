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
import WeatherCache from './utils/weatherCache';
import useGeolocation from './hooks/useGeolocation';
import useTheme from './hooks/useTheme';
import useWeatherBackground from './hooks/useWeatherBackground';
import useTranslation from './hooks/useTranslation';

function App() {
  const [data, setData] = useState({});
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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;

    try {
      const response = await axios.get(url);
      const weatherData = response.data;
      
      cache.current.set(`${lat},${lon}`, weatherData);
      setData(weatherData);
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
    }
  }, [language, t]);

  const fetchWeatherData = useCallback(async (cityName) => {
    const cachedData = cache.current.get(cityName);
    
    if (cachedData) {
      setData(cachedData);
      setError('');
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;

    try {
      const response = await axios.get(url);
      const weatherData = response.data;
      
      cache.current.set(cityName, weatherData);
      setData(weatherData);
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
    }
  }, [language, t]);


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
          <WeatherDisplay data={data} />
        )}
      </div>
    </div>
  );
}

export default App;
