import axios from 'axios';

/**
 * Service pour interagir avec l'API OpenWeatherMap
 * Utilisé comme service de fallback dans l'agrégateur météo
 */
class OpenWeatherMapService {
  constructor() {
    // API Key - À déplacer vers les variables d'environnement en production
    this.apiKey = '6c340e80b8feccd3cda97f5924a86d8a';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Récupère les données météo par coordonnées géographiques
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude  
   * @param {string} language - Code langue (fr, en, etc.)
   * @returns {Promise<Object>} Données météo
   */
  async getWeatherByCoords(lat, lon, language = 'en') {
    const url = `${this.baseUrl}/weather`;
    const params = {
      lat,
      lon,
      lang: language,
      appid: this.apiKey,
      units: 'metric'
    };

    const response = await axios.get(url, { params });
    return response.data;
  }

  /**
   * Récupère les données météo par nom de ville
   * @param {string} cityName - Nom de la ville
   * @param {string} language - Code langue (fr, en, etc.)
   * @returns {Promise<Object>} Données météo
   */
  async getWeatherByCity(cityName, language = 'en') {
    const url = `${this.baseUrl}/weather`;
    const params = {
      q: cityName.trim(),
      lang: language,
      appid: this.apiKey,
      units: 'metric'
    };

    const response = await axios.get(url, { params });
    return response.data;
  }

  /**
   * Vérifie la disponibilité du service
   * @returns {Promise<boolean>} True si le service est disponible
   */
  async checkAvailability() {
    try {
      const url = `${this.baseUrl}/weather`;
      const params = {
        q: 'London',
        appid: this.apiKey
      };

      await axios.get(url, { params, timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retourne les statistiques d'usage du service
   * @returns {Object} Statistiques du service
   */
  getUsageStats() {
    return {
      name: 'OpenWeatherMap',
      dailyQuota: 1000,
      monthlyCost: 0,
      isAvailable: true,
      features: ['Current Weather', 'Forecasts', 'Global Coverage']
    };
  }
}

export default OpenWeatherMapService;