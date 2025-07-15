import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, MainContent } from './layouts';
import AppLoadingScreen from './components/AppLoadingScreen';
import useGeolocation from './hooks/useGeolocation';
import useTheme from './hooks/useTheme';
import useWeatherBackground from './hooks/useWeatherBackground';
import useTranslation from './hooks/useTranslation';
import useAutoRefresh from './hooks/useAutoRefresh';
import useWeatherData from './hooks/useWeatherData';
import useAppLoading from './hooks/useAppLoading';

/**
 * Composant principal de l'application WeatherGlass
 * Gère l'état global et orchestre les différents hooks
 */
function App() {
  // État local pour la recherche
  const [location, setLocation] = useState('');
  const debounceTimer = useRef(null);
  
  // Hooks personnalisés
  const { themeMode, theme, toggleTheme } = useTheme();
  const { t, language } = useTranslation();
  const { isLoading, loadingStep, finishLoading, setStep } = useAppLoading();
  
  // Hook pour la géolocalisation
  const { 
    location: geoLocation, 
    loading: geoLoading, 
    error: geoError, 
    getCurrentLocation,
    isSupported: isGeoSupported 
  } = useGeolocation(t);
  
  // Hook pour l'arrière-plan dynamique
  const { currentBackground, updateBackground } = useWeatherBackground();
  
  // Hook pour les données météo (logique centralisée)
  const {
    data,
    forecastData,
    loading: weatherLoading,
    error: weatherError,
    fetchWeatherByCoords,
    fetchWeatherByCity,
    setLoading,
    setError
  } = useWeatherData(language, t);
  
  // Synchroniser les étapes de chargement avec les hooks
  useEffect(() => {
    if (geoLoading) {
      setStep('location');
    }
  }, [geoLoading, setStep]);
  
  useEffect(() => {
    if (weatherLoading) {
      setStep('weather');
    }
  }, [weatherLoading, setStep]);
  
  useEffect(() => {
    if (forecastData) {
      setStep('forecast');
    }
  }, [forecastData, setStep]);
  
  useEffect(() => {
    if (currentBackground) {
      setStep('background');
    }
  }, [currentBackground, setStep]);
  
  // Terminer le chargement quand tout est prêt
  useEffect(() => {
    if (data && !weatherLoading && !geoLoading && currentBackground) {
      // Délai pour permettre une transition fluide
      setTimeout(() => {
        finishLoading();
      }, 800);
    }
  }, [data, weatherLoading, geoLoading, currentBackground, finishLoading]);

  /**
   * Gestionnaire de recherche par touche Entrée
   * Déclenche la recherche météo par nom de ville
   */
  const searchLocation = useCallback((event) => {
    if (event.key === 'Enter') {
      // Nettoyer le timer de debounce précédent
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Validation de l'entrée
      if (!location.trim()) {
        setError(t('search.errors.emptyInput'));
        return;
      }

      // Lancement de la recherche
      setLoading(true);
      setError('');
      
      fetchWeatherByCity(location).finally(() => {
        setLoading(false);
        setLocation(''); // Réinitialiser le champ de recherche
      });
    }
  }, [location, fetchWeatherByCity, setLoading, setError, t]);

  /**
   * Gestionnaire du bouton de géolocalisation
   * Déclenche la récupération de la position actuelle
   */
  const handleLocationClick = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  /**
   * Fonction de rafraîchissement automatique
   * Récupère les données selon la dernière source utilisée
   */
  const autoRefreshWeather = useCallback(() => {
    if (geoLocation) {
      fetchWeatherByCoords(geoLocation.latitude, geoLocation.longitude);
    } else if (data.name) {
      fetchWeatherByCity(data.name);
    }
  }, [geoLocation, data.name, fetchWeatherByCoords, fetchWeatherByCity]);

  // Configuration de l'auto-refresh (20 minutes)
  const { forceRefresh } = useAutoRefresh({
    refreshFunction: autoRefreshWeather,
    interval: 20 * 60 * 1000,
    enabled: !!(data.name || geoLocation),
    dependencies: [data.name, geoLocation]
  });

  // Effet pour la géolocalisation
  useEffect(() => {
    if (geoLocation) {
      setLoading(true);
      fetchWeatherByCoords(geoLocation.latitude, geoLocation.longitude)
        .finally(() => setLoading(false));
    }
  }, [geoLocation, fetchWeatherByCoords, setLoading]);

  // Effet pour les erreurs de géolocalisation
  useEffect(() => {
    if (geoError) {
      setError(geoError);
    }
  }, [geoError, setError]);

  // Effet pour la géolocalisation automatique au lancement
  useEffect(() => {
    // Déclencher la géolocalisation automatiquement au premier chargement
    // Seulement si on n'a pas déjà des données météo et que la géolocalisation est supportée
    if (!data.name && isGeoSupported && !geoLocation && !geoLoading && !geoError) {
      getCurrentLocation();
    }
  }, [data.name, isGeoSupported, geoLocation, geoLoading, geoError, getCurrentLocation]);

  // Gestionnaires pour la géolocalisation d'erreur
  const handleRetryGeolocation = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleSkipGeolocation = useCallback(() => {
    // Simplement permettre à l'utilisateur de continuer sans géolocalisation
    // L'interface SearchInput sera disponible pour la recherche manuelle
  }, []);

  // Effet pour la mise à jour de l'arrière-plan
  useEffect(() => {
    if (data.weather?.[0] && data.name) {
      const weatherCondition = data.weather[0].main;
      const city = data.name;
      
      // Préparer les données solaires si disponibles
      const sunData = data.sys ? {
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
        latitude: data.coord?.lat || null // Ajouter la latitude pour déterminer l'hémisphère
      } : null;
      
      updateBackground(weatherCondition, city, sunData);
    }
  }, [data.weather, data.name, data.sys, data.timezone, data.coord, updateBackground]);

  // États dérivés
  const isWeatherLoading = weatherLoading || geoLoading;
  const currentError = weatherError || '';
  const hasWeatherData = data.name || geoLocation;

  // Afficher l'écran de chargement si nécessaire
  if (isLoading) {
    return <AppLoadingScreen loadingStep={loadingStep} />;
  }

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
        searchLoading={weatherLoading}
        searchError={currentError}
        onLocationClick={handleLocationClick}
        locationLoading={geoLoading}
        locationError={geoError}
        isLocationSupported={isGeoSupported}
        onRetryGeolocation={handleRetryGeolocation}
        onSkipGeolocation={handleSkipGeolocation}
        weatherData={data}
        forecastData={forecastData}
        loading={isWeatherLoading}
      />
    </Layout>
  );
}

export default App;