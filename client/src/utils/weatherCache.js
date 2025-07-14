/**
 * Cache intelligent pour les données météo
 * Implémente une stratégie LRU avec expiration automatique
 */
class WeatherCache {
  /**
   * @param {number} maxSize - Taille maximale du cache (défaut: 20)
   * @param {number} ttl - Durée de vie en millisecondes (défaut: 10min)
   */
  constructor(maxSize = 20, ttl = 10 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Récupère une donnée du cache
   * @param {string} key - Clé de recherche
   * @returns {*|null} Données mises en cache ou null si expirées/inexistantes
   */
  get(key) {
    const normalizedKey = key.toLowerCase().trim();
    const item = this.cache.get(normalizedKey);
    
    if (!item) return null;
    
    // Vérifier l'expiration
    const isExpired = Date.now() - item.timestamp > this.ttl;
    
    if (isExpired) {
      this.cache.delete(normalizedKey);
      return null;
    }
    
    return item.data;
  }

  /**
   * Ajoute une donnée au cache
   * Implémente une éviction LRU si le cache est plein
   * @param {string} key - Clé de stockage
   * @param {*} data - Données à mettre en cache
   */
  set(key, data) {
    const normalizedKey = key.toLowerCase().trim();
    
    // Éviction LRU si le cache est plein
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(normalizedKey, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export default WeatherCache;