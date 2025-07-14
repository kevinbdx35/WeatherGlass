import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { Layout, MainContent } from './layouts';
import WeatherCache from './utils/weatherCache';
import WeatherAggregator from './services/weatherAggregator';
import useGeolocation from './hooks/useGeolocation';
import useTheme from './hooks/useTheme';
import useWeatherBackground from './hooks/useWeatherBackground';
import useTranslation from './hooks/useTranslation';
import useAutoRefresh from './hooks/useAutoRefresh';

function App() {
  // État principal de l'application
  const [data, setData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Références et utilitaires
  const cache = useRef(new WeatherCache());
  const debounceTimer = useRef(null);
  const weatherAggregator = useRef(null);
  
  // Initialiser l'agrégateur météo avec service legacy
  useEffect(() => {
    if (!weatherAggregator.current) {
      weatherAggregator.current = new WeatherAggregator();
      
      // Injecter le service OpenWeatherMap existant comme fallback legacy
      const legacyService = {
        async getWeatherByCoords(lat, lon, language) {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
          const response = await axios.get(url);
          return response.data;
        },
        async getWeatherByCity(cityName, language) {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
          const response = await axios.get(url);
          return response.data;
        },
        async checkAvailability() {
          try {
            await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=6c340e80b8feccd3cda97f5924a86d8a`, { timeout: 5000 });
            return true;
          } catch {
            return false;
          }
        },
        getUsageStats() {
          return {
            name: 'OpenWeatherMap',
            dailyQuota: 1000,
            monthlyCost: 0,
            isAvailable: true,
            features: ['Current Weather', 'Forecasts', 'Global Coverage']
          };
        }
      };
      
      weatherAggregator.current.setLegacyService(legacyService);
    }
  }, []);
  
  // Hooks personnalisés
  const { themeMode, theme, toggleTheme } = useTheme();
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
    updateBackground
  } = useWeatherBackground();

  // Gestion des erreurs API avec multi-sources
  const handleApiError = useCallback((err) => {
    if (err.message?.includes('City not found') || err.message?.includes('not found')) {
      setError(t('search.errors.cityNotFound'));
    } else if (err.message?.includes('Invalid API key') || err.response?.status === 401) {
      setError(t('search.errors.authError'));
    } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
      setError(t('search.errors.networkError'));
    } else if (err.message?.includes('All weather services failed')) {
      setError('Tous les services météo sont indisponibles. Veuillez réessayer plus tard.');
    } else {
      setError(t('common.error'));
    }
    setData({});
    setForecastData([]);
  }, [t]);

  // Traitement des données de prévision
  const processForecastData = useCallback((forecastList) => {
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
  }, []);

  // API calls - Logique métier avec agrégation multi-sources
  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    console.log('🌍 fetchWeatherByCoords called with:', { lat, lon });
    if (!weatherAggregator.current) {
      console.log('❌ WeatherAggregator not initialized');
      return;
    }
    
    const cacheKey = `${lat},${lon}`;
    const cachedData = cache.current.get(cacheKey);
    const cachedForecast = cache.current.get(`forecast_${cacheKey}`);
    
    if (cachedData && cachedForecast) {
      setData(cachedData);
      setForecastData(cachedForecast);
      setError('');
      return;
    }

    try {
      console.log('🚀 Calling aggregator.getWeatherByCoords...');
      const weatherData = await weatherAggregator.current.getWeatherByCoords(lat, lon, language);
      console.log('📦 Weather data received:', weatherData);
      
      // Essayer d'obtenir les prévisions, avec fallback vers les données existantes si échec
      let dailyForecasts = [];
      try {
        const forecastData = await weatherAggregator.current.getForecastData({ lat, lon }, language);
        dailyForecasts = Array.isArray(forecastData) ? forecastData : processForecastData(forecastData.list || []);
      } catch (forecastError) {
        console.warn('Forecast data unavailable, using weather data only');
        // Si les prévisions échouent, on continue avec juste les données météo actuelles
      }
      
      cache.current.set(cacheKey, weatherData);
      cache.current.set(`forecast_${cacheKey}`, dailyForecasts);
      
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
      
      console.log(`Weather fetched using ${weatherData.aggregator?.usedSource || 'unknown'} source`);
    } catch (err) {
      console.warn('All weather sources failed:', err.message);
      handleApiError(err);
    }
  }, [language]);

  const fetchWeatherData = useCallback(async (cityName) => {
    console.log('🏙️ fetchWeatherData called with:', cityName);
    if (!weatherAggregator.current) {
      console.log('❌ WeatherAggregator not initialized');
      return;
    }
    
    const cachedData = cache.current.get(cityName);
    const cachedForecast = cache.current.get(`forecast_${cityName}`);
    
    if (cachedData && cachedForecast) {
      setData(cachedData);
      setForecastData(cachedForecast);
      setError('');
      return;
    }

    try {
      const weatherData = await weatherAggregator.current.getWeatherByCity(cityName, language);
      
      // Essayer d'obtenir les prévisions, avec fallback vers les données existantes si échec
      let dailyForecasts = [];
      try {
        const forecastData = await weatherAggregator.current.getForecastData(cityName, language);
        dailyForecasts = Array.isArray(forecastData) ? forecastData : processForecastData(forecastData.list || []);
      } catch (forecastError) {
        console.warn('Forecast data unavailable, using weather data only');
        // Si les prévisions échouent, on continue avec juste les données météo actuelles
      }
      
      cache.current.set(cityName, weatherData);
      cache.current.set(`forecast_${cityName}`, dailyForecasts);
      
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
      
      console.log(`Weather fetched using ${weatherData.aggregator?.usedSource || 'unknown'} source`);
    } catch (err) {
      console.warn('All weather sources failed:', err.message);
      handleApiError(err);
    }
  }, [language, handleApiError, processForecastData]);

  // Gestionnaires d'événements
  const searchLocation = useCallback((event) => {
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
  }, [location, fetchWeatherData, t]);

  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Auto-refresh
  const autoRefreshWeather = useCallback(() => {
    if (geoLocation) {
      fetchWeatherByCoords(geoLocation.latitude, geoLocation.longitude);
    } else if (data.name) {
      fetchWeatherData(data.name);
    }
  }, [geoLocation, data.name, fetchWeatherByCoords, fetchWeatherData]);

  const { forceRefresh } = useAutoRefresh({
    refreshFunction: autoRefreshWeather,
    interval: 20 * 60 * 1000, // 20 minutes
    enabled: !!(data.name || geoLocation),
    dependencies: [data.name, geoLocation]
  });

  // Effets
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

  useEffect(() => {
    if (data.weather && data.weather[0] && data.name) {
      const weatherCondition = data.weather[0].main;
      const city = data.name;
      updateBackground(weatherCondition, city);
    }
  }, [data.weather, data.name, updateBackground]);

  // État global pour le layout
  const isLoading = loading || geoLoading;
  const hasWeatherData = data.name || geoLocation;

  return (
    <Layout
      theme={theme}
      themeMode={themeMode}
      onThemeToggle={toggleTheme}
      currentBackground={currentBackground}
      autoRefresh={forceRefresh}
      showAutoRefresh={hasWeatherData}
    >
      <MainContent
        location={location}
        setLocation={setLocation}
        onSearchKeyPress={searchLocation}
        searchLoading={loading}
        searchError={error}
        onLocationClick={handleLocationClick}
        locationLoading={geoLoading}
        isLocationSupported={isGeoSupported}
        weatherData={data}
        forecastData={forecastData}
        loading={isLoading}
      />
    </Layout>
  );
}

export default App;