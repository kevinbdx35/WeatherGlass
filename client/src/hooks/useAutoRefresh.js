import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour le rafraîchissement automatique des données
 * Gère la visibilité de l'onglet et optimise les appels réseau
 * @param {Object} config - Configuration du hook
 * @param {Function} config.refreshFunction - Fonction à exécuter pour rafraîchir
 * @param {number} config.interval - Intervalle en millisecondes (défaut: 30min)
 * @param {boolean} config.enabled - Active/désactive l'auto-refresh
 * @param {Array} config.dependencies - Dépendances pour redémarrer l'intervalle
 */
const useAutoRefresh = ({ 
  refreshFunction, 
  interval = 30 * 60 * 1000, // 30 minutes par défaut
  enabled = true,
  dependencies = [] 
}) => {
  const intervalRef = useRef(null);
  const visibilityRef = useRef(true);
  const lastRefreshRef = useRef(null);

  // Fonction pour nettoyer l'intervalle
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Fonction pour démarrer l'auto-refresh
  const startAutoRefresh = useCallback(() => {
    clearCurrentInterval();
    
    if (!enabled || !refreshFunction) return;

    intervalRef.current = setInterval(() => {
      // Ne pas actualiser si l'onglet n'est pas visible
      if (!visibilityRef.current) return;
      
      // Vérifier si assez de temps s'est écoulé depuis la dernière actualisation
      const now = Date.now();
      if (lastRefreshRef.current && (now - lastRefreshRef.current) < interval) {
        return;
      }
      
      lastRefreshRef.current = now;
      refreshFunction();
    }, interval);
  }, [enabled, refreshFunction, interval, clearCurrentInterval]);

  // Gérer la visibilité de la page
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    visibilityRef.current = isVisible;
    
    if (isVisible) {
      // Quand l'utilisateur revient sur l'onglet, vérifier si une actualisation est nécessaire
      const now = Date.now();
      const timeSinceLastRefresh = lastRefreshRef.current ? now - lastRefreshRef.current : interval + 1;
      
      if (timeSinceLastRefresh >= interval && enabled && refreshFunction) {
        lastRefreshRef.current = now;
        refreshFunction();
      }
    }
  }, [interval, enabled, refreshFunction]);

  // Fonction pour forcer une actualisation manuelle
  const forceRefresh = useCallback(() => {
    if (refreshFunction) {
      lastRefreshRef.current = Date.now();
      refreshFunction();
    }
  }, [refreshFunction]);

  // Fonction pour réinitialiser le timer
  const resetTimer = useCallback(() => {
    lastRefreshRef.current = Date.now();
    startAutoRefresh();
  }, [startAutoRefresh]);

  // Effet pour gérer l'auto-refresh
  useEffect(() => {
    startAutoRefresh();
    
    // Ajouter l'écouteur de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearCurrentInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAutoRefresh, handleVisibilityChange, clearCurrentInterval, ...dependencies]);

  // Effet pour nettoyer lors du démontage
  useEffect(() => {
    return () => {
      clearCurrentInterval();
    };
  }, [clearCurrentInterval]);

  return {
    forceRefresh,
    resetTimer,
    isAutoRefreshEnabled: enabled
  };
};

export default useAutoRefresh;