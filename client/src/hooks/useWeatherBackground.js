import { useState, useEffect, useCallback, useRef } from 'react';
import unsplashService from '../services/unsplashService';

const useWeatherBackground = () => {
  const [currentBackground, setCurrentBackground] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastWeatherRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const sunTimerRef = useRef(null);
  const currentWeatherRef = useRef(null);

  const updateBackground = useCallback(async (weatherCondition, city = '', sunData = null) => {
    if (!weatherCondition) return;

    // Créer une clé qui inclut les données temporelles pour détecter les changements jour/nuit
    const timeKey = sunData ? `${sunData.sunrise}_${sunData.sunset}` : new Date().getHours();
    const weatherKey = `${weatherCondition}_${city}_${timeKey}`;
    if (lastWeatherRef.current === weatherKey) {
      return;
    }

    // Annuler toute transition en cours
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setLoading(true);
    setError(null);
    lastWeatherRef.current = weatherKey;
    
    // Stocker les données actuelles pour les timers
    currentWeatherRef.current = { weatherCondition, city, sunData };

    try {
      // Récupérer la nouvelle image avec les données solaires
      const imageData = await unsplashService.searchWeatherImage(weatherCondition, city, sunData);
      
      if (imageData && imageData.url) {
        // Précharger l'image avant de l'afficher
        await unsplashService.preloadImage(imageData.url);
        
        // Mettre à jour directement sans transition complexe
        setCurrentBackground(imageData);
      }
    } catch (err) {
      console.error('Erreur lors du changement de background:', err);
      setError('Impossible de charger l\'image de fond');
      // En cas d'erreur, garder l'image actuelle
    } finally {
      setLoading(false);
      
      // Programmer les changements automatiques au lever/coucher du soleil
      if (sunData?.sunrise && sunData?.sunset) {
        scheduleSunTimers(sunData);
      }
    }
  }, [scheduleSunTimers]);

  // Programmer les timers pour les changements automatiques
  const scheduleSunTimers = useCallback((sunData) => {
    if (sunTimerRef.current) {
      clearTimeout(sunTimerRef.current);
    }

    const now = Date.now();
    const sunriseTime = (sunData.sunrise + sunData.timezone) * 1000;
    const sunsetTime = (sunData.sunset + sunData.timezone) * 1000;
    
    // Calculer le prochain événement solaire
    let nextEventTime = null;
    
    if (now < sunriseTime) {
      // Avant le lever du soleil
      nextEventTime = sunriseTime;
    } else if (now < sunsetTime) {
      // Entre lever et coucher du soleil
      nextEventTime = sunsetTime;
    } else {
      // Après le coucher du soleil, programmer pour le lever du soleil du lendemain
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0); // Approximation pour le lendemain
      nextEventTime = tomorrow.getTime();
    }
    
    const delay = nextEventTime - now;
    
    // Ne programmer que si l'événement est dans les prochaines 24h
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      sunTimerRef.current = setTimeout(() => {
        // Déclencher une mise à jour automatique
        const current = currentWeatherRef.current;
        if (current) {
          // Forcer une mise à jour en réinitialisant la clé de cache
          lastWeatherRef.current = null;
          updateBackground(current.weatherCondition, current.city, current.sunData);
        }
      }, delay);
    }
  }, [updateBackground]);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    const timeoutRef = transitionTimeoutRef;
    const sunRef = sunTimerRef;
    return () => {
      // Copier les références pour éviter les problèmes de concurrence
      const currentTimeout = timeoutRef.current;
      const currentSunTimer = sunRef.current;
      
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
      if (currentSunTimer) {
        clearTimeout(currentSunTimer);
      }
    };
  }, []);

  const resetBackground = useCallback(() => {
    setCurrentBackground(null);
    setError(null);
    lastWeatherRef.current = null;
    currentWeatherRef.current = null;
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (sunTimerRef.current) {
      clearTimeout(sunTimerRef.current);
    }
  }, []);

  return {
    currentBackground,
    loading,
    error,
    updateBackground,
    resetBackground
  };
};

export default useWeatherBackground;