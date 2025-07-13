import { useState, useEffect, useCallback, useRef } from 'react';
import unsplashService from '../services/unsplashService';

const useWeatherBackground = () => {
  const [currentBackground, setCurrentBackground] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastWeatherRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  const updateBackground = useCallback(async (weatherCondition, city = '') => {
    if (!weatherCondition) return;

    // Éviter les changements redondants
    const weatherKey = `${weatherCondition}_${city}`;
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

    try {
      // Récupérer la nouvelle image
      const imageData = await unsplashService.searchWeatherImage(weatherCondition, city);
      
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
    }
  }, []);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const resetBackground = useCallback(() => {
    setCurrentBackground(null);
    setError(null);
    lastWeatherRef.current = null;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
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