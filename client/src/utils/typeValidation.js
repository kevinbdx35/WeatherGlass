/**
 * Utilitaires de validation de type pour prévenir les erreurs de runtime
 * Ces fonctions aident à valider les données avant d'effectuer des opérations qui pourraient échouer
 */

/**
 * Vérifie si une valeur est un nombre valide et fini
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} - true si c'est un nombre fini valide
 */
export function isValidNumber(value) {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Vérifie si une valeur est une chaîne de caractères non vide
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} - true si c'est une chaîne non vide
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Vérifie si une valeur est un tableau non vide
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} - true si c'est un tableau avec des éléments
 */
export function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Vérifie si une valeur est un objet valide (non null, non array)
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} - true si c'est un objet valide
 */
export function isValidObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Vérifie si une date est valide
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} - true si c'est une date valide
 */
export function isValidDate(value) {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
}

/**
 * Convertit une valeur en nombre sûr ou retourne une valeur par défaut
 * @param {any} value - La valeur à convertir
 * @param {number} defaultValue - Valeur par défaut si la conversion échoue
 * @returns {number} - Le nombre converti ou la valeur par défaut
 */
export function safeNumber(value, defaultValue = 0) {
  if (isValidNumber(value)) {
    return value;
  }
  
  const parsed = parseFloat(value);
  if (isValidNumber(parsed)) {
    return parsed;
  }
  
  return defaultValue;
}

/**
 * Formate un nombre avec un nombre spécifique de décimales de manière sûre
 * @param {any} value - La valeur à formater
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @param {string} fallback - Valeur de retour si le formatage échoue
 * @returns {string} - Le nombre formaté ou la valeur de fallback
 */
export function safeToFixed(value, decimals = 2, fallback = '0.00') {
  const num = safeNumber(value);
  
  try {
    return num.toFixed(decimals);
  } catch (error) {
    console.warn('safeToFixed error:', error);
    return fallback;
  }
}

/**
 * Accès sûr aux propriétés d'objet avec valeur par défaut
 * @param {object} obj - L'objet source
 * @param {string} path - Le chemin vers la propriété (ex: 'a.b.c')
 * @param {any} defaultValue - Valeur par défaut si la propriété n'existe pas
 * @returns {any} - La valeur trouvée ou la valeur par défaut
 */
export function safePath(obj, path, defaultValue = null) {
  if (!isValidObject(obj)) {
    return defaultValue;
  }
  
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  } catch (error) {
    console.warn('safePath error:', error);
    return defaultValue;
  }
}

/**
 * Validation spécifique pour les données d'agrégateur météo
 * @param {object} aggregatorData - Les données de l'agrégateur
 * @returns {object} - Objet de validation avec isValid et errors
 */
export function validateAggregatorData(aggregatorData) {
  const errors = [];
  
  if (!isValidObject(aggregatorData)) {
    return { isValid: false, errors: ['Aggregator data must be an object'] };
  }
  
  // Vérifier la stratégie
  const strategy = aggregatorData.strategy;
  const validStrategies = ['fallback', 'consensus', 'specialized'];
  if (!validStrategies.includes(strategy)) {
    errors.push(`Invalid strategy: ${strategy}`);
  }
  
  // Vérifier les données de validation
  const validation = aggregatorData.validation;
  if (isValidObject(validation)) {
    const score = validation.score;
    if (score !== undefined && !isValidNumber(score)) {
      errors.push('Validation score must be a number');
    }
    
    if (score !== undefined && (score < 0 || score > 1)) {
      errors.push('Validation score must be between 0 and 1');
    }
  }
  
  // Vérifier les données de consensus
  if (strategy === 'consensus') {
    const sources = aggregatorData.sources;
    if (!isNonEmptyArray(sources)) {
      errors.push('Consensus mode requires non-empty sources array');
    }
    
    const multiSourceValidation = aggregatorData.multiSourceValidation;
    if (isValidObject(multiSourceValidation)) {
      const variance = multiSourceValidation.variance;
      if (variance !== undefined && isValidObject(variance)) {
        const temperature = variance.temperature;
        if (temperature !== undefined && !isValidNumber(temperature)) {
          errors.push('Variance temperature must be a number');
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Nettoyage sûr des données météo pour éviter les erreurs de rendu
 * @param {object} weatherData - Les données météo brutes
 * @returns {object} - Les données nettoyées et validées
 */
export function sanitizeWeatherData(weatherData) {
  if (!isValidObject(weatherData)) {
    return null;
  }
  
  const cleaned = { ...weatherData };
  
  // Nettoyer les données principales
  if (isValidObject(cleaned.main)) {
    cleaned.main = {
      ...cleaned.main,
      temp: safeNumber(cleaned.main.temp),
      humidity: safeNumber(cleaned.main.humidity),
      pressure: safeNumber(cleaned.main.pressure)
    };
  }
  
  // Nettoyer les données de vent
  if (isValidObject(cleaned.wind)) {
    cleaned.wind = {
      ...cleaned.wind,
      speed: safeNumber(cleaned.wind.speed),
      deg: safeNumber(cleaned.wind.deg)
    };
  }
  
  // Nettoyer les données d'agrégateur
  if (isValidObject(cleaned.aggregator)) {
    const validation = validateAggregatorData(cleaned.aggregator);
    if (!validation.isValid) {
      console.warn('Invalid aggregator data:', validation.errors);
      // Nettoyer les données problématiques
      if (cleaned.aggregator.validation) {
        cleaned.aggregator.validation.score = safeNumber(cleaned.aggregator.validation.score, 0);
      }
    }
  }
  
  return cleaned;
}

/**
 * Fonction de validation d'ensemble pour prévenir les erreurs de type
 * @param {any} data - Les données à valider
 * @param {string} context - Contexte pour le logging des erreurs
 * @returns {boolean} - true si les données sont sûres à utiliser
 */
export function validateForSafeRendering(data, context = 'unknown') {
  try {
    // Test de sérialisation JSON pour détecter les références circulaires
    JSON.stringify(data);
    
    // Validation spécifique selon le contexte
    if (context === 'weather-display') {
      return isValidObject(data) && isValidObject(data.main);
    }
    
    if (context === 'data-quality') {
      return isValidObject(data) && isValidObject(data.aggregator);
    }
    
    return true;
  } catch (error) {
    console.warn(`Validation failed for ${context}:`, error);
    return false;
  }
}

export default {
  isValidNumber,
  isNonEmptyString,
  isNonEmptyArray,
  isValidObject,
  isValidDate,
  safeNumber,
  safeToFixed,
  safePath,
  validateAggregatorData,
  sanitizeWeatherData,
  validateForSafeRendering
};