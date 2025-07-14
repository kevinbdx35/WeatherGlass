/**
 * Oracle météorologique - Validateur de données météo
 * 
 * Cet Oracle valide la qualité, la cohérence et la fiabilité des données météo
 * provenant de différentes sources API. Il agit comme une source de vérité
 * pour détecter les anomalies et garantir la qualité des données.
 */
class WeatherOracle {
  constructor() {
    this.validationStats = {
      totalValidations: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      lastReset: new Date().toDateString()
    };
    
    // Seuils de validation configurables
    this.thresholds = {
      temperature: { min: -100, max: 60 }, // °C
      humidity: { min: 0, max: 100 }, // %
      pressure: { min: 800, max: 1200 }, // hPa
      windSpeed: { min: 0, max: 150 }, // m/s (max théorique ~150 m/s pour tornades)
      visibility: { min: 0, max: 50000 }, // mètres
      temperatureVariation: 30, // Variation max entre min/max quotidienne
      multiSourceVariance: 10 // Écart max acceptable entre sources (°C)
    };
  }

  /**
   * Validation principale d'un objet données météo
   * @param {Object} weatherData - Données météo à valider
   * @param {string} source - Source des données (pour traçabilité)
   * @returns {Object} Résultat de validation avec score et détails
   */
  validateWeatherData(weatherData, source = 'unknown') {
    this.validationStats.totalValidations++;
    this.resetStatsIfNeeded();

    const validation = {
      isValid: true,
      score: 1.0, // Score de qualité 0-1
      warnings: [],
      errors: [],
      source: source,
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // 1. Validation de structure
      validation.checks.structure = this.validateStructure(weatherData);
      
      // 2. Validations physiques
      validation.checks.temperature = this.validateTemperature(weatherData);
      validation.checks.humidity = this.validateHumidity(weatherData);
      validation.checks.pressure = this.validatePressure(weatherData);
      validation.checks.wind = this.validateWind(weatherData);
      validation.checks.visibility = this.validateVisibility(weatherData);
      
      // 3. Validations de cohérence interne
      validation.checks.coherence = this.validateCoherence(weatherData);
      
      // 4. Validations temporelles
      validation.checks.temporal = this.validateTemporal(weatherData);

      // Calculer le score global et déterminer la validité
      this.calculateValidationScore(validation);
      
      if (validation.score < 0.7) {
        validation.isValid = false;
        this.validationStats.failed++;
      } else if (validation.score < 0.9) {
        this.validationStats.warnings++;
      } else {
        this.validationStats.passed++;
      }

    } catch (error) {
      validation.isValid = false;
      validation.score = 0;
      validation.errors.push(`Oracle validation error: ${error.message}`);
      this.validationStats.failed++;
    }

    return validation;
  }

  /**
   * Validation de la structure des données
   */
  validateStructure(data) {
    const result = { passed: true, score: 1.0, issues: [] };

    // Vérifications essentielles
    const requiredFields = ['main', 'weather', 'name'];
    const requiredMainFields = ['temp', 'humidity'];

    for (const field of requiredFields) {
      if (!data[field]) {
        result.issues.push(`Missing required field: ${field}`);
        result.score -= 0.3;
      }
    }

    if (data.main) {
      for (const field of requiredMainFields) {
        if (data.main[field] === undefined || data.main[field] === null) {
          result.issues.push(`Missing required main.${field}`);
          result.score -= 0.2;
        }
      }
    }

    if (data.weather && (!Array.isArray(data.weather) || data.weather.length === 0)) {
      result.issues.push('Weather array is empty or invalid');
      result.score -= 0.2;
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation des températures
   */
  validateTemperature(data) {
    const result = { passed: true, score: 1.0, issues: [] };
    
    if (!data.main) return result;

    const temps = {
      current: data.main.temp,
      feelsLike: data.main.feels_like,
      min: data.main.temp_min,
      max: data.main.temp_max
    };

    // Vérifier les plages physiques
    Object.entries(temps).forEach(([key, temp]) => {
      if (temp !== undefined && temp !== null) {
        if (temp < this.thresholds.temperature.min || temp > this.thresholds.temperature.max) {
          result.issues.push(`${key} temperature ${temp}°C outside physical range`);
          result.score -= 0.6; // Plus pénalisant
        }
      }
    });

    // Vérifier la cohérence min/max
    if (temps.min !== undefined && temps.max !== undefined) {
      if (temps.min > temps.max) {
        result.issues.push(`min temp (${temps.min}) > max temp (${temps.max})`);
        result.score -= 0.7; // Plus pénalisant pour incohérence logique
      }
      
      if (temps.max - temps.min > this.thresholds.temperatureVariation) {
        result.issues.push(`Excessive temperature variation: ${temps.max - temps.min}°C`);
        result.score -= 0.1;
      }
    }

    // Vérifier feels_like vs current
    if (temps.current !== undefined && temps.feelsLike !== undefined) {
      const diff = Math.abs(temps.current - temps.feelsLike);
      if (diff > 20) {
        result.issues.push(`Excessive feels_like difference: ${diff}°C`);
        result.score -= 0.1;
      }
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation de l'humidité
   */
  validateHumidity(data) {
    const result = { passed: true, score: 1.0, issues: [] };
    
    if (!data.main || data.main.humidity === undefined) return result;

    const humidity = data.main.humidity;
    
    if (humidity < this.thresholds.humidity.min || humidity > this.thresholds.humidity.max) {
      result.issues.push(`Humidity ${humidity}% outside valid range`);
      result.score -= 0.5;
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation de la pression
   */
  validatePressure(data) {
    const result = { passed: true, score: 1.0, issues: [] };
    
    if (!data.main || data.main.pressure === undefined) return result;

    const pressure = data.main.pressure;
    
    if (pressure < this.thresholds.pressure.min || pressure > this.thresholds.pressure.max) {
      result.issues.push(`Pressure ${pressure} hPa outside realistic range`);
      result.score -= 0.6; // Plus pénalisant pour valeurs impossibles
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation du vent
   */
  validateWind(data) {
    const result = { passed: true, score: 1.0, issues: [] };
    
    if (!data.wind) return result;

    if (data.wind.speed !== undefined) {
      if (data.wind.speed < this.thresholds.windSpeed.min || data.wind.speed > this.thresholds.windSpeed.max) {
        result.issues.push(`Wind speed ${data.wind.speed} m/s outside realistic range`);
        result.score -= 0.6; // Plus pénalisant pour valeurs impossibles
      }
    }

    if (data.wind.deg !== undefined) {
      if (data.wind.deg < 0 || data.wind.deg > 360) {
        result.issues.push(`Wind direction ${data.wind.deg}° outside valid range`);
        result.score -= 0.6; // Plus pénalisant pour valeurs impossibles
      }
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation de la visibilité
   */
  validateVisibility(data) {
    const result = { passed: true, score: 1.0, issues: [] };
    
    if (data.visibility === undefined) return result;

    if (data.visibility < this.thresholds.visibility.min || data.visibility > this.thresholds.visibility.max) {
      result.issues.push(`Visibility ${data.visibility}m outside realistic range`);
      result.score -= 0.2;
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation de cohérence interne
   */
  validateCoherence(data) {
    const result = { passed: true, score: 1.0, issues: [] };

    // Cohérence météo principale vs température
    if (data.weather && data.weather[0] && data.main) {
      const condition = data.weather[0].main;
      const temp = data.main.temp;

      // Vérifications logiques
      if (condition === 'Snow' && temp > 5) {
        result.issues.push(`Snow reported at ${temp}°C (too warm)`);
        result.score -= 0.2;
      }

      if (condition === 'Rain' && data.main.humidity < 30) {
        result.issues.push(`Rain reported with low humidity (${data.main.humidity}%)`);
        result.score -= 0.1;
      }
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Validation temporelle
   */
  validateTemporal(data) {
    const result = { passed: true, score: 1.0, issues: [] };

    // Vérifier si les données ne sont pas trop anciennes
    if (data.dt) {
      const dataAge = (Date.now() / 1000) - data.dt;
      if (dataAge > 7200) { // Plus de 2 heures
        result.issues.push(`Data is ${Math.round(dataAge / 3600)}h old`);
        result.score -= 0.1;
      }
    }

    result.passed = result.score > 0.5;
    return result;
  }

  /**
   * Calculer le score global de validation
   */
  calculateValidationScore(validation) {
    const checks = validation.checks;
    let totalScore = 0;
    let checkCount = 0;
    let hasCriticalFailure = false;

    Object.values(checks).forEach(check => {
      if (check && check.score !== undefined) {
        totalScore += check.score;
        checkCount++;
        
        // Détecter les échecs critiques (score très bas)
        if (check.score <= 0.5) {
          hasCriticalFailure = true;
        }
        
        if (check.issues && check.issues.length > 0) {
          if (check.passed) {
            validation.warnings.push(...check.issues);
          } else {
            validation.errors.push(...check.issues);
          }
        }
      }
    });

    validation.score = checkCount > 0 ? totalScore / checkCount : 0;
    
    // Si il y a un échec critique, le score ne peut pas dépasser 0.6
    if (hasCriticalFailure) {
      validation.score = Math.min(validation.score, 0.6);
    }
    
    validation.isValid = validation.score >= 0.7 && validation.errors.length === 0;
  }

  /**
   * Comparer les données de plusieurs sources
   */
  compareMultipleSources(sources) {
    const comparison = {
      isCoherent: true,
      variance: {},
      discrepancies: [],
      recommendedSource: null,
      confidence: 1.0
    };

    if (sources.length < 2) return comparison;

    // Comparer les températures
    const temps = sources.map(s => s.data.main?.temp).filter(t => t !== undefined);
    if (temps.length >= 2) {
      const tempVariance = Math.max(...temps) - Math.min(...temps);
      comparison.variance.temperature = tempVariance;
      
      if (tempVariance > this.thresholds.multiSourceVariance) {
        comparison.isCoherent = false;
        comparison.discrepancies.push(`Temperature variance: ${tempVariance.toFixed(1)}°C`);
        comparison.confidence -= 0.3;
      }
    }

    // Comparer les conditions météo
    const conditions = sources.map(s => s.data.weather?.[0]?.main).filter(c => c);
    const uniqueConditions = [...new Set(conditions)];
    if (uniqueConditions.length > 1) {
      comparison.discrepancies.push(`Different weather conditions: ${uniqueConditions.join(', ')}`);
      comparison.confidence -= 0.2;
    }

    // Recommander la source la plus fiable
    const validatedSources = sources.map(source => ({
      ...source,
      validation: this.validateWeatherData(source.data, source.name)
    }));

    validatedSources.sort((a, b) => b.validation.score - a.validation.score);
    comparison.recommendedSource = validatedSources[0];

    return comparison;
  }

  /**
   * Obtenir les statistiques de l'Oracle
   */
  getStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.totalValidations > 0 
        ? (this.validationStats.passed / this.validationStats.totalValidations * 100).toFixed(1)
        : 0,
      thresholds: this.thresholds
    };
  }

  /**
   * Réinitialiser les stats quotidiennes
   */
  resetStatsIfNeeded() {
    const today = new Date().toDateString();
    if (this.validationStats.lastReset !== today) {
      this.validationStats.totalValidations = 0;
      this.validationStats.passed = 0;
      this.validationStats.failed = 0;
      this.validationStats.warnings = 0;
      this.validationStats.lastReset = today;
    }
  }
}

export default WeatherOracle;