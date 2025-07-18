import { useState } from 'react';

/**
 * Hook personnalisé pour la géolocalisation
 * Gère la récupération de la position GPS de l'utilisateur
 * @param {Function} t - Fonction de traduction
 * @returns {Object} État et fonctions de géolocalisation
 */
const useGeolocation = (t) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère la position actuelle de l'utilisateur
   * Utilise l'API Geolocation du navigateur
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t ? t('search.errors.locationError') : 'Geolocation not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        let errorKey = 'search.errors.locationError';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorKey = 'search.errors.locationDenied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorKey = 'search.errors.locationUnavailable';
            break;
          case error.TIMEOUT:
            errorKey = 'search.errors.locationTimeout';
            break;
          default:
            errorKey = 'search.errors.locationError';
        }
        
        setError(t ? t(errorKey) : 'Location error');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    isSupported: !!navigator.geolocation
  };
};

export default useGeolocation;