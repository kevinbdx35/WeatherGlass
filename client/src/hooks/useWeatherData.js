import { useState, useCallback, useRef, useEffect } from 'react';
import WeatherCache from '../utils/weatherCache';
import WeatherAggregator from '../services/weatherAggregator';
import OpenWeatherMapService from '../services/openWeatherMapService';

/**
 * Hook personnalisé pour la gestion des données météo
 * Centralise toute la logique de récupération et de cache des données
 */
const useWeatherData = (language, t) => {
  // États
  const [data, setData] = useState({});
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Références
  const cache = useRef(new WeatherCache());
  const weatherAggregator = useRef(null);

  // Initialisation de l'agrégateur météo
  useEffect(() => {
    if (!weatherAggregator.current) {
      weatherAggregator.current = new WeatherAggregator();
      
      // Configuration du service de fallback
      const openWeatherService = new OpenWeatherMapService();
      weatherAggregator.current.setLegacyService(openWeatherService);
    }
  }, []);

  /**
   * Traite les données de prévision pour les adapter aux composants
   * @param {Array} forecastList - Liste des prévisions
   * @returns {Array} Données de prévision formatées
   */
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

  /**
   * Gère les erreurs API et les convertit en messages utilisateur
   * @param {Error} err - Erreur à traiter
   */
  const handleApiError = useCallback((err) => {
    const errorMessage = err.message || '';
    
    if (errorMessage.includes('City not found') || errorMessage.includes('not found')) {
      setError(t('search.errors.cityNotFound'));
    } else if (errorMessage.includes('Invalid API key') || err.response?.status === 401) {
      setError(t('search.errors.authError'));
    } else if (err.code === 'NETWORK_ERROR' || errorMessage.includes('Network Error')) {
      setError(t('search.errors.networkError'));
    } else if (errorMessage.includes('All weather services failed')) {
      setError('Tous les services météo sont indisponibles. Veuillez réessayer plus tard.');
    } else {
      setError(t('common.error'));
    }
    
    setData({});
    setForecastData([]);
  }, [t]);

  /**
   * Récupère les données météo par coordonnées
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    if (!weatherAggregator.current) return;
    
    const cacheKey = `${lat},${lon}`;
    const cachedData = cache.current.get(cacheKey);
    const cachedForecast = cache.current.get(`forecast_${cacheKey}`);
    
    // Utiliser le cache si disponible
    if (cachedData && cachedForecast) {
      setData(cachedData);
      setForecastData(cachedForecast);
      setError('');
      return;
    }

    try {
      // Récupération des données météo actuelles
      const weatherData = await weatherAggregator.current.getWeatherByCoords(lat, lon, language);
      
      // Récupération des prévisions (avec fallback)
      let dailyForecasts = [];
      try {
        const forecastData = await weatherAggregator.current.getForecastData({ lat, lon }, language);
        dailyForecasts = Array.isArray(forecastData) 
          ? forecastData.map(forecast => ({
              date: new Date(forecast.dt * 1000),
              maxTemp: forecast.main.temp_max,
              minTemp: forecast.main.temp_min,
              avgTemp: forecast.main.temp,
              description: forecast.weather[0].description,
              icon: forecast.weather[0].icon,
              main: forecast.weather[0].main,
              humidity: forecast.main.humidity || 50,
              windSpeed: forecast.wind.speed || 0
            }))
          : processForecastData(forecastData.list || []);
      } catch (forecastError) {
        console.warn('Forecast data unavailable, using weather data only');
      }
      
      // Mise en cache
      cache.current.set(cacheKey, weatherData);
      cache.current.set(`forecast_${cacheKey}`, dailyForecasts);
      
      // Mise à jour des états
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
      
      console.log(`Weather fetched using ${weatherData.aggregator?.usedSource || 'unknown'} source`);
    } catch (err) {
      console.warn('All weather sources failed:', err.message);
      handleApiError(err);
    }
  }, [language, processForecastData, handleApiError]);

  /**
   * Récupère les données météo par nom de ville
   * @param {string} cityName - Nom de la ville
   */
  const fetchWeatherByCity = useCallback(async (cityName) => {
    if (!weatherAggregator.current) return;
    
    const cachedData = cache.current.get(cityName);
    const cachedForecast = cache.current.get(`forecast_${cityName}`);
    
    // Utiliser le cache si disponible
    if (cachedData && cachedForecast) {
      setData(cachedData);
      setForecastData(cachedForecast);
      setError('');
      return;
    }

    try {
      // Récupération des données météo actuelles
      const weatherData = await weatherAggregator.current.getWeatherByCity(cityName, language);
      
      // Récupération des prévisions (avec fallback)
      let dailyForecasts = [];
      try {
        const forecastData = await weatherAggregator.current.getForecastData(cityName, language);
        dailyForecasts = Array.isArray(forecastData) 
          ? forecastData.map(forecast => ({
              date: new Date(forecast.dt * 1000),
              maxTemp: forecast.main.temp_max,
              minTemp: forecast.main.temp_min,
              avgTemp: forecast.main.temp,
              description: forecast.weather[0].description,
              icon: forecast.weather[0].icon,
              main: forecast.weather[0].main,
              humidity: forecast.main.humidity || 50,
              windSpeed: forecast.wind.speed || 0
            }))
          : processForecastData(forecastData.list || []);
      } catch (forecastError) {
        console.warn('Forecast data unavailable, using weather data only');
      }
      
      // Mise en cache
      cache.current.set(cityName, weatherData);
      cache.current.set(`forecast_${cityName}`, dailyForecasts);
      
      // Mise à jour des états
      setData(weatherData);
      setForecastData(dailyForecasts);
      setError('');
      
      console.log(`Weather fetched using ${weatherData.aggregator?.usedSource || 'unknown'} source`);
    } catch (err) {
      console.warn('All weather sources failed:', err.message);
      handleApiError(err);
    }
  }, [language, processForecastData, handleApiError]);

  return {
    // États
    data,
    forecastData,
    loading,
    error,
    
    // Actions
    fetchWeatherByCoords,
    fetchWeatherByCity,
    setLoading,
    setError
  };
};

export default useWeatherData;