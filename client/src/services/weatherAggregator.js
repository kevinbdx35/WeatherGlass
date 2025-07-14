import OpenMeteoService from './openMeteoService';
import WeatherAPIService from './weatherAPIService';
import MeteoFranceService from './meteoFranceService';
import WeatherOracle from './weatherOracle';

/**
 * Agrégateur de sources météo gratuites
 * - Stratégie de fallback intelligent
 * - Consensus entre sources multiples
 * - Intégration des alertes officielles
 * - Optimisation des quotas gratuits
 */
class WeatherAggregator {
  constructor() {
    this.services = {
      primary: new OpenMeteoService(),     // 10k appels/jour
      backup: new WeatherAPIService(),     // 1M appels/mois  
      alerts: new MeteoFranceService(),    // 500 appels/jour + alertes
      legacy: null                         // OpenWeatherMap (sera injecté)
    };
    
    this.strategy = 'fallback'; // 'fallback' | 'consensus' | 'specialized'
    this.cache = new Map();
    this.oracle = new WeatherOracle(); // Oracle de validation
    this.usageStats = {
      calls: { primary: 0, backup: 0, alerts: 0, legacy: 0 },
      errors: { primary: 0, backup: 0, alerts: 0, legacy: 0 },
      lastReset: new Date().toDateString()
    };
  }

  /**
   * Injecter le service OpenWeatherMap existant
   */
  setLegacyService(openWeatherMapService) {
    this.services.legacy = openWeatherMapService;
  }

  /**
   * Changer la stratégie d'agrégation
   */
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  /**
   * Obtenir les données météo avec stratégie de fallback
   */
  async getWeatherByCoords(lat, lon, language = 'en') {
    this.resetDailyStatsIfNeeded();

    switch (this.strategy) {
      case 'consensus':
        return await this.getConsensusWeather(lat, lon, language);
      case 'specialized':
        return await this.getSpecializedWeather(lat, lon, language);
      default:
        return await this.getFallbackWeather(lat, lon, language);
    }
  }

  /**
   * Obtenir les données météo par ville
   */
  async getWeatherByCity(cityName, language = 'en') {
    this.resetDailyStatsIfNeeded();

    switch (this.strategy) {
      case 'consensus':
        return await this.getConsensusWeatherByCity(cityName, language);
      case 'specialized':
        return await this.getSpecializedWeatherByCity(cityName, language);
      default:
        return await this.getFallbackWeatherByCity(cityName, language);
    }
  }

  /**
   * Stratégie de fallback : Essayer les sources dans l'ordre de fiabilité
   */
  async getFallbackWeather(lat, lon, language) {
    const cacheKey = `fallback_${lat}_${lon}_${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const sources = [
      { service: this.services.primary, name: 'primary' },
      { service: this.services.backup, name: 'backup' },
      { service: this.services.legacy, name: 'legacy' }
    ];

    for (const { service, name } of sources) {
      if (!service) continue;

      try {
        console.log(`Trying ${name} service for weather data...`);
        this.usageStats.calls[name]++;
        
        const data = await service.getWeatherByCoords(lat, lon, language);
        
        // Enrichir avec les alertes Météo France si en France
        if (this.isInFrance(lat, lon)) {
          try {
            const alerts = await this.services.alerts.getWeatherAlerts();
            data.alerts = alerts;
            data.hasOfficialAlerts = alerts.length > 0;
          } catch (alertError) {
            console.warn('Failed to get alerts:', alertError.message);
            data.alerts = [];
            data.hasOfficialAlerts = false;
          }
        }

        // Validation Oracle des données
        const validation = this.oracle.validateWeatherData(data, name);
        
        // Ajouter métadonnées de source et validation
        data.aggregator = {
          strategy: 'fallback',
          usedSource: name,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(name),
          validation: {
            isValid: validation.isValid,
            score: validation.score,
            warnings: validation.warnings,
            errors: validation.errors
          }
        };

        // Logger les problèmes de validation
        if (!validation.isValid) {
          console.warn(`Oracle validation failed for ${name}:`, validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn(`Oracle warnings for ${name}:`, validation.warnings);
        }

        this.cache.set(cacheKey, data);
        return data;

      } catch (error) {
        console.warn(`${name} service failed:`, error.message);
        this.usageStats.errors[name]++;
        continue;
      }
    }

    throw new Error('All weather services failed');
  }

  /**
   * Stratégie spécialisée : Choisir la meilleure source selon le contexte
   */
  async getSpecializedWeather(lat, lon, language) {
    // Pour l'instant, utiliser la stratégie de fallback
    // Peut être étendue avec de la logique plus sophistiquée
    return await this.getFallbackWeather(lat, lon, language);
  }

  /**
   * Stratégie spécialisée par ville
   */
  async getSpecializedWeatherByCity(cityName, language) {
    // Pour l'instant, utiliser la stratégie de fallback
    // Peut être étendue avec de la logique plus sophistiquée
    return await this.getFallbackWeatherByCity(cityName, language);
  }

  /**
   * Stratégie de consensus par ville
   */
  async getConsensusWeatherByCity(cityName, language) {
    // Pour l'instant, utiliser la stratégie de fallback
    // Peut être étendue avec de la logique de consensus
    return await this.getFallbackWeatherByCity(cityName, language);
  }

  /**
   * Stratégie de fallback pour recherche par ville
   */
  async getFallbackWeatherByCity(cityName, language) {
    const cacheKey = `fallback_city_${cityName}_${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Priorité spéciale pour villes françaises
    const isLikelyFrench = this.isLikelyFrenchCity(cityName);
    
    let sources;
    if (isLikelyFrench) {
      sources = [
        { service: this.services.alerts, name: 'alerts' }, // Météo France en priorité
        { service: this.services.primary, name: 'primary' },
        { service: this.services.backup, name: 'backup' },
        { service: this.services.legacy, name: 'legacy' }
      ];
    } else {
      sources = [
        { service: this.services.primary, name: 'primary' },
        { service: this.services.backup, name: 'backup' },
        { service: this.services.legacy, name: 'legacy' }
      ];
    }

    for (const { service, name } of sources) {
      if (!service) continue;

      try {
        console.log(`Trying ${name} service for city ${cityName}...`);
        this.usageStats.calls[name]++;
        
        const data = await service.getWeatherByCity(cityName, language);
        
        // Enrichir avec alertes si ville française
        if (isLikelyFrench || this.isInFrance(data.coord.lat, data.coord.lon)) {
          try {
            const alerts = await this.services.alerts.getWeatherAlerts();
            data.alerts = alerts;
            data.hasOfficialAlerts = alerts.length > 0;
          } catch (alertError) {
            data.alerts = [];
            data.hasOfficialAlerts = false;
          }
        }

        // Validation Oracle des données
        const validation = this.oracle.validateWeatherData(data, name);
        
        data.aggregator = {
          strategy: 'fallback',
          usedSource: name,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(name),
          validation: {
            isValid: validation.isValid,
            score: validation.score,
            warnings: validation.warnings,
            errors: validation.errors
          }
        };

        // Logger les problèmes de validation
        if (!validation.isValid) {
          console.warn(`Oracle validation failed for ${name}:`, validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn(`Oracle warnings for ${name}:`, validation.warnings);
        }

        this.cache.set(cacheKey, data);
        return data;

      } catch (error) {
        console.warn(`${name} service failed for ${cityName}:`, error.message);
        this.usageStats.errors[name]++;
        continue;
      }
    }

    throw new Error(`All weather services failed for city: ${cityName}`);
  }

  /**
   * Stratégie de consensus : Combiner plusieurs sources
   */
  async getConsensusWeather(lat, lon, language) {
    const cacheKey = `consensus_${lat}_${lon}_${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const sources = [
      { service: this.services.primary, name: 'primary' },
      { service: this.services.backup, name: 'backup' },
      { service: this.services.legacy, name: 'legacy' }
    ];

    const results = await Promise.allSettled(
      sources.filter(s => s.service).map(async ({ service, name }) => {
        this.usageStats.calls[name]++;
        const data = await service.getWeatherByCoords(lat, lon, language);
        return { data, source: name };
      })
    );

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length === 0) {
      throw new Error('All weather services failed for consensus');
    }

    // Calculer consensus
    const consensus = this.calculateConsensus(successful);
    
    // Ajouter alertes si en France
    if (this.isInFrance(lat, lon)) {
      try {
        consensus.alerts = await this.services.alerts.getWeatherAlerts();
        consensus.hasOfficialAlerts = consensus.alerts.length > 0;
      } catch (error) {
        consensus.alerts = [];
        consensus.hasOfficialAlerts = false;
      }
    }

    // Validation Oracle multi-sources
    const sourcesForOracle = successful.map(s => ({ name: s.source, data: s.data }));
    const multiSourceValidation = this.oracle.compareMultipleSources(sourcesForOracle);

    consensus.aggregator = {
      strategy: 'consensus',
      sources: successful.map(s => s.source),
      agreement: this.calculateAgreement(successful),
      timestamp: new Date().toISOString(),
      confidence: this.calculateConsensusConfidence(successful),
      multiSourceValidation: {
        isCoherent: multiSourceValidation.isCoherent,
        variance: multiSourceValidation.variance,
        discrepancies: multiSourceValidation.discrepancies,
        recommendedSource: multiSourceValidation.recommendedSource?.name,
        confidence: multiSourceValidation.confidence
      }
    };

    // Logger les incohérences multi-sources
    if (!multiSourceValidation.isCoherent) {
      console.warn('Multi-source discrepancies detected:', multiSourceValidation.discrepancies);
    }

    this.cache.set(cacheKey, consensus);
    return consensus;
  }

  /**
   * Calculer un consensus entre plusieurs sources
   */
  calculateConsensus(results) {
    if (results.length === 1) {
      return results[0].data;
    }

    const base = results[0].data;
    const temps = results.map(r => r.data.main.temp);
    const humidity = results.map(r => r.data.main.humidity);
    const windSpeeds = results.map(r => r.data.wind.speed);

    return {
      ...base,
      main: {
        ...base.main,
        temp: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
        humidity: Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length)
      },
      wind: {
        ...base.wind,
        speed: Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length)
      },
      source: 'Consensus',
      consensus: {
        temperature_range: [Math.min(...temps), Math.max(...temps)],
        sources_count: results.length,
        agreement_score: this.calculateAgreement(results)
      }
    };
  }

  /**
   * Calculer le niveau d'accord entre sources
   */
  calculateAgreement(results) {
    if (results.length < 2) return 1.0;

    const temps = results.map(r => r.data.main.temp);
    const tempRange = Math.max(...temps) - Math.min(...temps);
    
    // Score d'accord basé sur l'écart de température
    if (tempRange <= 1) return 0.95;
    if (tempRange <= 2) return 0.85;
    if (tempRange <= 3) return 0.75;
    if (tempRange <= 5) return 0.65;
    return 0.5;
  }

  /**
   * Calculer la confiance selon la source
   */
  calculateConfidence(sourceName) {
    const confidence = {
      primary: 0.9,   // Open-Meteo très fiable
      backup: 0.85,   // WeatherAPI bon
      alerts: 0.95,   // Météo France officiel
      legacy: 0.8     // OpenWeatherMap standard
    };
    return confidence[sourceName] || 0.7;
  }

  /**
   * Calculer la confiance du consensus
   */
  calculateConsensusConfidence(results) {
    const agreement = this.calculateAgreement(results);
    const baseConfidence = results.reduce((sum, r) => 
      sum + this.calculateConfidence(r.source), 0) / results.length;
    
    return Math.min(0.98, baseConfidence * agreement);
  }

  /**
   * Vérifier si les coordonnées sont en France
   */
  isInFrance(lat, lon) {
    return lat >= 41.0 && lat <= 51.5 && lon >= -5.5 && lon <= 10.0;
  }

  /**
   * Détecter si une ville est probablement française
   */
  isLikelyFrenchCity(cityName) {
    const frenchCities = [
      'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 
      'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes'
    ];
    return frenchCities.some(city => 
      cityName.toLowerCase().includes(city) || city.includes(cityName.toLowerCase())
    );
  }

  /**
   * Obtenir les prévisions agrégées
   */
  async getForecastData(location, language = 'en') {
    try {
      // Utiliser la source principale pour les prévisions
      this.usageStats.calls.primary++;
      
      let weatherData;
      if (typeof location === 'string') {
        weatherData = await this.services.primary.getWeatherByCity(location, language);
      } else {
        weatherData = await this.services.primary.getWeatherByCoords(location.lat, location.lon, language);
      }

      // Open-Meteo inclut déjà les données de prévision dans raw_data
      if (weatherData.raw_data && weatherData.raw_data.daily) {
        return this.services.primary.getForecastData(weatherData);
      }

      // Fallback si pas de données raw_data (autres services)
      throw new Error('No forecast data in primary response');
      
    } catch (error) {
      console.warn('Primary forecast failed, trying backup...', error.message);
      this.usageStats.errors.primary++;
      
      try {
        this.usageStats.calls.backup++;
        if (typeof location === 'string') {
          return await this.services.backup.getForecastByCity(location, language);
        } else {
          return await this.services.backup.getForecastByCoords(location.lat, location.lon, language);
        }
      } catch (backupError) {
        this.usageStats.errors.backup++;
        
        // Dernier recours avec le service legacy
        try {
          if (this.services.legacy && typeof location === 'string') {
            const legacyUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
            const response = await fetch(legacyUrl);
            const data = await response.json();
            return this.processLegacyForecastData(data.list || []);
          }
        } catch (legacyError) {
          // Ignore legacy errors
        }
        
        throw new Error('All forecast services failed');
      }
    }
  }

  /**
   * Traiter les données de prévision legacy (OpenWeatherMap)
   */
  processLegacyForecastData(forecastList) {
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
  }

  /**
   * Réinitialiser les stats quotidiennes
   */
  resetDailyStatsIfNeeded() {
    const today = new Date().toDateString();
    if (this.usageStats.lastReset !== today) {
      this.usageStats.calls = { primary: 0, backup: 0, alerts: 0, legacy: 0 };
      this.usageStats.errors = { primary: 0, backup: 0, alerts: 0, legacy: 0 };
      this.usageStats.lastReset = today;
    }
  }

  /**
   * Obtenir les statistiques d'usage avec Oracle
   */
  getUsageStats() {
    return {
      strategy: this.strategy,
      daily_calls: this.usageStats.calls,
      daily_errors: this.usageStats.errors,
      cache_size: this.cache.size,
      oracle_stats: this.oracle.getStats(),
      services: Object.keys(this.services)
        .filter(key => this.services[key])
        .map(key => ({
          name: key,
          ...this.services[key].getUsageStats()
        }))
    };
  }

  /**
   * Obtenir les métriques de qualité Oracle
   */
  getQualityMetrics() {
    return this.oracle.getStats();
  }

  /**
   * Vider le cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Vérifier la santé de tous les services
   */
  async checkHealth() {
    const health = {};
    
    for (const [name, service] of Object.entries(this.services)) {
      if (service) {
        try {
          health[name] = await service.checkAvailability();
        } catch (error) {
          health[name] = false;
        }
      } else {
        health[name] = false;
      }
    }

    return health;
  }
}

export default WeatherAggregator;