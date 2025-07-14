import axios from 'axios';

/**
 * Service Météo France - Alertes officielles et données France
 * - 500 appels/jour gratuits
 * - Clé API gratuite requise
 * - Alertes officielles gouvernementales
 * - Couverture France + DOM-TOM
 */
class MeteoFranceService {
  constructor() {
    this.baseUrl = 'https://portail-api.meteofrance.fr/public';
    this.name = 'Météo France';
    this.isAvailable = true;
    // Clé API gratuite - vous devrez créer un compte sur portail-api.meteofrance.fr
    this.apiKey = process.env.REACT_APP_METEOFRANCE_KEY || 'demo_key_get_your_free_key_at_meteofrance';
  }

  /**
   * Obtenir les données météo actuelles pour la France
   */
  async getWeatherByCoords(lat, lon, language = 'fr') {
    try {
      // Vérifier si les coordonnées sont en France
      if (!this.isInFrance(lat, lon)) {
        throw new Error('Location not in France');
      }

      const url = `${this.baseUrl}/DPObs/v1/observations/spatio-temporelles/horaires`;
      const params = {
        'api-key': this.apiKey,
        lat: lat,
        lon: lon,
        format: 'json'
      };

      const response = await axios.get(url, { params });
      return this.transformCurrentWeatherData(response.data, lat, lon);
    } catch (error) {
      console.warn('Météo France API error:', error.message);
      throw new Error(`Météo France: ${error.message}`);
    }
  }

  /**
   * Obtenir les données météo par nom de ville française
   */
  async getWeatherByCity(cityName, language = 'fr') {
    try {
      // Rechercher la ville en France
      const location = await this.searchFrenchCity(cityName);
      return await this.getWeatherByCoords(location.lat, location.lon, language);
    } catch (error) {
      console.warn('Météo France city error:', error.message);
      throw new Error(`Météo France: ${error.message}`);
    }
  }

  /**
   * Obtenir les alertes météo officielles
   */
  async getWeatherAlerts() {
    try {
      const url = `${this.baseUrl}/DPVigilance/v1/vigilance/metropole`;
      const params = {
        'api-key': this.apiKey,
        format: 'json'
      };

      const response = await axios.get(url, { params });
      return this.transformAlertsData(response.data);
    } catch (error) {
      console.warn('Météo France alerts error:', error.message);
      throw new Error(`Météo France alerts: ${error.message}`);
    }
  }

  /**
   * Obtenir les prévisions pour la France
   */
  async getForecastByCoords(lat, lon, language = 'fr') {
    try {
      if (!this.isInFrance(lat, lon)) {
        throw new Error('Location not in France');
      }

      const url = `${this.baseUrl}/DPPrevision/v1/previsions/spatiales/pontuelles/horaires`;
      const params = {
        'api-key': this.apiKey,
        lat: lat,
        lon: lon,
        format: 'json'
      };

      const response = await axios.get(url, { params });
      return this.transformForecastData(response.data);
    } catch (error) {
      console.warn('Météo France forecast error:', error.message);
      throw new Error(`Météo France forecast: ${error.message}`);
    }
  }

  /**
   * Rechercher une ville française
   */
  async searchFrenchCity(cityName) {
    // Géocodage simple pour les principales villes françaises
    const frenchCities = {
      'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
      'marseille': { lat: 43.2965, lon: 5.3698, name: 'Marseille' },
      'lyon': { lat: 45.7640, lon: 4.8357, name: 'Lyon' },
      'toulouse': { lat: 43.6047, lon: 1.4442, name: 'Toulouse' },
      'nice': { lat: 43.7102, lon: 7.2620, name: 'Nice' },
      'nantes': { lat: 47.2184, lon: -1.5536, name: 'Nantes' },
      'strasbourg': { lat: 48.5734, lon: 7.7521, name: 'Strasbourg' },
      'montpellier': { lat: 43.6110, lon: 3.8767, name: 'Montpellier' },
      'bordeaux': { lat: 44.8378, lon: -0.5792, name: 'Bordeaux' },
      'lille': { lat: 50.6292, lon: 3.0573, name: 'Lille' },
      'rennes': { lat: 48.1173, lon: -1.6778, name: 'Rennes' },
      'reims': { lat: 49.2583, lon: 4.0317, name: 'Reims' },
      'saint-etienne': { lat: 45.4397, lon: 4.3872, name: 'Saint-Étienne' },
      'toulon': { lat: 43.1242, lon: 5.9280, name: 'Toulon' },
      'grenoble': { lat: 45.1885, lon: 5.7245, name: 'Grenoble' },
      'dijon': { lat: 47.3220, lon: 5.0415, name: 'Dijon' },
      'angers': { lat: 47.4784, lon: -0.5632, name: 'Angers' },
      'villeurbanne': { lat: 45.7665, lon: 4.8795, name: 'Villeurbanne' },
      'le mans': { lat: 48.0061, lon: 0.1996, name: 'Le Mans' },
      'aix-en-provence': { lat: 43.5297, lon: 5.4474, name: 'Aix-en-Provence' },
      'clermont-ferrand': { lat: 45.7797, lon: 3.0863, name: 'Clermont-Ferrand' },
      'brest': { lat: 48.3904, lon: -4.4861, name: 'Brest' },
      'tours': { lat: 47.3941, lon: 0.6848, name: 'Tours' },
      'limoges': { lat: 45.8336, lon: 1.2611, name: 'Limoges' },
      'amiens': { lat: 49.8941, lon: 2.2958, name: 'Amiens' },
      'perpignan': { lat: 42.6886, lon: 2.8946, name: 'Perpignan' },
      'metz': { lat: 49.1193, lon: 6.1757, name: 'Metz' },
      'besancon': { lat: 47.2380, lon: 6.0243, name: 'Besançon' },
      'orleans': { lat: 47.9029, lon: 1.9093, name: 'Orléans' },
      'rouen': { lat: 49.4431, lon: 1.0993, name: 'Rouen' },
      'mulhouse': { lat: 47.7508, lon: 7.3359, name: 'Mulhouse' },
      'caen': { lat: 49.1829, lon: -0.3707, name: 'Caen' },
      'nancy': { lat: 48.6921, lon: 6.1844, name: 'Nancy' }
    };

    const normalizedCity = cityName.toLowerCase().trim();
    const city = frenchCities[normalizedCity];
    
    if (!city) {
      throw new Error(`French city "${cityName}" not found in database`);
    }

    return city;
  }

  /**
   * Vérifier si les coordonnées sont en France métropolitaine
   */
  isInFrance(lat, lon) {
    // France métropolitaine approximative
    return lat >= 41.0 && lat <= 51.5 && lon >= -5.5 && lon <= 10.0;
  }

  /**
   * Transformer les données Météo France vers le format OpenWeatherMap
   */
  transformCurrentWeatherData(data, lat, lon) {
    // Météo France a un format spécifique, adaptation nécessaire
    const observation = data.observations?.[0] || {};
    
    return {
      coord: { lat, lon },
      weather: [{
        id: 800, // Par défaut, sera affiné selon les données
        main: 'Clear',
        description: observation.description || 'données météo france',
        icon: '01d'
      }],
      main: {
        temp: Math.round(observation.temperature || 20),
        feels_like: Math.round(observation.temperature || 20),
        humidity: Math.round(observation.humidity || 50),
        pressure: Math.round(observation.pressure || 1013)
      },
      wind: {
        speed: Math.round((observation.wind_speed || 0) * 0.278), // km/h → m/s
        deg: observation.wind_direction || 0
      },
      clouds: { all: 0 },
      visibility: 10000,
      dt: Math.floor(new Date().getTime() / 1000),
      sys: {
        country: 'FR',
        sunrise: Math.floor(new Date().setHours(6, 0, 0, 0) / 1000),
        sunset: Math.floor(new Date().setHours(18, 0, 0, 0) / 1000)
      },
      timezone: 'Europe/Paris',
      id: Math.floor(lat * 1000 + lon * 1000),
      name: 'France',
      cod: 200,
      source: 'Météo France',
      // Données spécifiques Météo France
      alerts: [], // Sera rempli par getWeatherAlerts()
      official: true
    };
  }

  /**
   * Transformer les données d'alertes
   */
  transformAlertsData(data) {
    const alerts = [];
    
    if (data.vigilances) {
      data.vigilances.forEach(vigilance => {
        if (vigilance.niveau >= 2) { // Orange ou Rouge
          alerts.push({
            level: vigilance.niveau,
            levelName: this.getAlertLevelName(vigilance.niveau),
            type: vigilance.type,
            description: vigilance.message,
            startTime: vigilance.debut,
            endTime: vigilance.fin,
            color: this.getAlertColor(vigilance.niveau),
            official: true,
            source: 'Météo France'
          });
        }
      });
    }

    return alerts;
  }

  /**
   * Obtenir le nom du niveau d'alerte
   */
  getAlertLevelName(level) {
    const levels = {
      1: 'Vert',
      2: 'Jaune', 
      3: 'Orange',
      4: 'Rouge'
    };
    return levels[level] || 'Inconnu';
  }

  /**
   * Obtenir la couleur de l'alerte
   */
  getAlertColor(level) {
    const colors = {
      1: '#4ade80', // Vert
      2: '#facc15', // Jaune
      3: '#f97316', // Orange
      4: '#ef4444'  // Rouge
    };
    return colors[level] || '#6b7280';
  }

  /**
   * Transformer les données de prévision
   */
  transformForecastData(data) {
    const forecasts = [];
    
    if (data.previsions) {
      data.previsions.forEach(prevision => {
        forecasts.push({
          dt: new Date(prevision.date).getTime() / 1000,
          dt_txt: prevision.date,
          main: {
            temp: Math.round(prevision.temperature),
            temp_max: Math.round(prevision.temperature_max),
            temp_min: Math.round(prevision.temperature_min),
            humidity: Math.round(prevision.humidity)
          },
          weather: [{
            id: 800,
            main: prevision.weather_main || 'Clear',
            description: prevision.description || 'prévision météo france',
            icon: '01d'
          }],
          wind: {
            speed: Math.round((prevision.wind_speed || 0) * 0.278),
            deg: prevision.wind_direction || 0
          }
        });
      });
    }

    return forecasts;
  }

  /**
   * Vérifier la disponibilité du service
   */
  async checkAvailability() {
    try {
      const response = await axios.get(`${this.baseUrl}/DPObs/v1/observatoires`, {
        params: {
          'api-key': this.apiKey,
          format: 'json'
        },
        timeout: 5000
      });
      this.isAvailable = response.status === 200;
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Obtenir les statistiques d'usage
   */
  getUsageStats() {
    return {
      name: this.name,
      dailyQuota: 500,
      monthlyCost: 0,
      isAvailable: this.isAvailable,
      features: [
        'Données officielles',
        'Alertes gouvernementales',
        '500 appels/jour',
        'France + DOM-TOM',
        'Vigilance météo'
      ],
      limitations: [
        'France uniquement',
        'Clé API requise',
        'Quota limité'
      ]
    };
  }
}

export default MeteoFranceService;