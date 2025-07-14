import axios from 'axios';

/**
 * Service WeatherAPI - Source météo gratuite de backup
 * - 1,000,000 appels/mois gratuits (33k/jour)
 * - Clé API gratuite requise
 * - Données en temps réel
 * - Couverture mondiale
 */
class WeatherAPIService {
  constructor() {
    this.baseUrl = 'https://api.weatherapi.com/v1';
    this.name = 'WeatherAPI';
    this.isAvailable = true;
    // Clé API gratuite - vous devrez créer un compte sur weatherapi.com
    this.apiKey = process.env.REACT_APP_WEATHERAPI_KEY || 'demo_key_get_your_free_key_at_weatherapi.com';
  }

  /**
   * Obtenir les données météo actuelles par coordonnées
   */
  async getWeatherByCoords(lat, lon, language = 'en') {
    try {
      const url = `${this.baseUrl}/current.json`;
      const params = {
        key: this.apiKey,
        q: `${lat},${lon}`,
        aqi: 'no',
        lang: this.mapLanguage(language)
      };

      const response = await axios.get(url, { params });
      return this.transformCurrentWeatherData(response.data);
    } catch (error) {
      console.warn('WeatherAPI error:', error.message);
      if (error.response?.status === 401) {
        throw new Error('WeatherAPI: Invalid API key');
      }
      throw new Error(`WeatherAPI: ${error.message}`);
    }
  }

  /**
   * Obtenir les données météo par nom de ville
   */
  async getWeatherByCity(cityName, language = 'en') {
    try {
      const url = `${this.baseUrl}/current.json`;
      const params = {
        key: this.apiKey,
        q: cityName.trim(),
        aqi: 'no',
        lang: this.mapLanguage(language)
      };

      const response = await axios.get(url, { params });
      return this.transformCurrentWeatherData(response.data);
    } catch (error) {
      console.warn('WeatherAPI error:', error.message);
      if (error.response?.status === 400) {
        throw new Error('City not found');
      }
      if (error.response?.status === 401) {
        throw new Error('WeatherAPI: Invalid API key');
      }
      throw new Error(`WeatherAPI: ${error.message}`);
    }
  }

  /**
   * Obtenir les prévisions sur 3 jours (limite gratuite)
   */
  async getForecastByCoords(lat, lon, language = 'en') {
    try {
      const url = `${this.baseUrl}/forecast.json`;
      const params = {
        key: this.apiKey,
        q: `${lat},${lon}`,
        days: 3, // Limite gratuite
        aqi: 'no',
        alerts: 'no',
        lang: this.mapLanguage(language)
      };

      const response = await axios.get(url, { params });
      return this.transformForecastData(response.data);
    } catch (error) {
      console.warn('WeatherAPI forecast error:', error.message);
      throw new Error(`WeatherAPI forecast: ${error.message}`);
    }
  }

  /**
   * Obtenir les prévisions par nom de ville
   */
  async getForecastByCity(cityName, language = 'en') {
    try {
      const url = `${this.baseUrl}/forecast.json`;
      const params = {
        key: this.apiKey,
        q: cityName.trim(),
        days: 3,
        aqi: 'no',
        alerts: 'no',
        lang: this.mapLanguage(language)
      };

      const response = await axios.get(url, { params });
      return this.transformForecastData(response.data);
    } catch (error) {
      console.warn('WeatherAPI forecast error:', error.message);
      throw new Error(`WeatherAPI forecast: ${error.message}`);
    }
  }

  /**
   * Transformer les données WeatherAPI vers le format OpenWeatherMap
   */
  transformCurrentWeatherData(data) {
    const location = data.location;
    const current = data.current;

    return {
      coord: { 
        lat: location.lat, 
        lon: location.lon 
      },
      weather: [{
        id: this.mapWeatherCondition(current.condition.code),
        main: this.getMainWeatherGroup(current.condition.code),
        description: current.condition.text.toLowerCase(),
        icon: this.mapWeatherIcon(current.condition.code, current.is_day)
      }],
      main: {
        temp: Math.round(current.temp_c),
        feels_like: Math.round(current.feelslike_c),
        humidity: current.humidity,
        pressure: Math.round(current.pressure_mb)
      },
      wind: {
        speed: Math.round(current.wind_kph * 0.278), // kph → m/s
        deg: current.wind_degree
      },
      clouds: { 
        all: Math.round(current.cloud) 
      },
      visibility: Math.round(current.vis_km * 1000), // km → m
      dt: current.last_updated_epoch,
      sys: {
        country: location.country,
        sunrise: Math.floor(new Date().setHours(6, 0, 0, 0) / 1000), // Approximation
        sunset: Math.floor(new Date().setHours(18, 0, 0, 0) / 1000)
      },
      timezone: location.tz_id,
      id: Math.floor(location.lat * 1000 + location.lon * 1000),
      name: location.name,
      cod: 200,
      source: 'WeatherAPI',
      // Données spécifiques WeatherAPI
      uv_index: current.uv,
      gust_kph: current.gust_kph
    };
  }

  /**
   * Transformer les données de prévision
   */
  transformForecastData(data) {
    const forecasts = [];
    
    data.forecast.forecastday.forEach(day => {
      day.hour.forEach(hour => {
        // const date = new Date(hour.time); // Réservé pour usage futur
        
        forecasts.push({
          dt: hour.time_epoch,
          dt_txt: hour.time,
          main: {
            temp: Math.round(hour.temp_c),
            temp_max: Math.round(day.day.maxtemp_c),
            temp_min: Math.round(day.day.mintemp_c),
            humidity: hour.humidity,
            pressure: Math.round(hour.pressure_mb)
          },
          weather: [{
            id: this.mapWeatherCondition(hour.condition.code),
            main: this.getMainWeatherGroup(hour.condition.code),
            description: hour.condition.text.toLowerCase(),
            icon: this.mapWeatherIcon(hour.condition.code, hour.is_day)
          }],
          wind: {
            speed: Math.round(hour.wind_kph * 0.278),
            deg: hour.wind_degree
          },
          rain: hour.precip_mm > 0 ? { '3h': hour.precip_mm } : undefined
        });
      });
    });

    return forecasts;
  }

  /**
   * Mapper les codes météo WeatherAPI vers OpenWeatherMap
   */
  mapWeatherCondition(code) {
    const conditionMap = {
      1000: 800, // Sunny/Clear
      1003: 801, // Partly cloudy
      1006: 802, // Cloudy
      1009: 803, // Overcast
      1030: 741, // Mist
      1063: 500, // Patchy rain possible
      1066: 600, // Patchy snow possible
      1069: 611, // Patchy sleet possible
      1072: 511, // Patchy freezing drizzle possible
      1087: 200, // Thundery outbreaks possible
      1114: 601, // Blowing snow
      1117: 602, // Blizzard
      1135: 741, // Fog
      1147: 741, // Freezing fog
      1150: 300, // Patchy light drizzle
      1153: 301, // Light drizzle
      1168: 302, // Freezing drizzle
      1171: 302, // Heavy freezing drizzle
      1180: 500, // Patchy light rain
      1183: 501, // Light rain
      1186: 501, // Moderate rain at times
      1189: 502, // Moderate rain
      1192: 502, // Heavy rain at times
      1195: 503, // Heavy rain
      1198: 511, // Light freezing rain
      1201: 511, // Moderate or heavy freezing rain
      1204: 611, // Light sleet
      1207: 613, // Moderate or heavy sleet
      1210: 600, // Patchy light snow
      1213: 600, // Light snow
      1216: 601, // Patchy moderate snow
      1219: 601, // Moderate snow
      1222: 602, // Patchy heavy snow
      1225: 602, // Heavy snow
      1237: 615, // Ice pellets
      1240: 520, // Light rain shower
      1243: 521, // Moderate or heavy rain shower
      1246: 522, // Torrential rain shower
      1249: 611, // Light sleet showers
      1252: 613, // Moderate or heavy sleet showers
      1255: 620, // Light snow showers
      1258: 621, // Moderate or heavy snow showers
      1261: 615, // Light showers of ice pellets
      1264: 615, // Moderate or heavy showers of ice pellets
      1273: 200, // Patchy light rain with thunder
      1276: 201, // Moderate or heavy rain with thunder
      1279: 230, // Patchy light snow with thunder
      1282: 232  // Moderate or heavy snow with thunder
    };

    return conditionMap[code] || 800;
  }

  /**
   * Obtenir le groupe météo principal
   */
  getMainWeatherGroup(code) {
    if (code === 1000) return 'Clear';
    if ([1003, 1006, 1009].includes(code)) return 'Clouds';
    if ([1030, 1135, 1147].includes(code)) return 'Fog';
    if (code >= 1150 && code <= 1201) return 'Rain';
    if (code >= 1063 && code <= 1072) return 'Rain';
    if (code >= 1180 && code <= 1246) return 'Rain';
    if (code >= 1204 && code <= 1237) return 'Snow';
    if (code >= 1210 && code <= 1264) return 'Snow';
    if (code >= 1066 && code <= 1117) return 'Snow';
    if (code >= 1273 && code <= 1282) return 'Thunderstorm';
    if (code === 1087) return 'Thunderstorm';
    return 'Clear';
  }

  /**
   * Mapper les icônes météo
   */
  mapWeatherIcon(code, isDay) {
    const dayNight = isDay ? 'd' : 'n';
    
    if (code === 1000) return `01${dayNight}`;
    if (code === 1003) return `02${dayNight}`;
    if ([1006, 1009].includes(code)) return `03${dayNight}`;
    if ([1030, 1135, 1147].includes(code)) return `50${dayNight}`;
    if (code >= 1150 && code <= 1201) return `09${dayNight}`;
    if (code >= 1180 && code <= 1246) return `10${dayNight}`;
    if (code >= 1204 && code <= 1264) return `13${dayNight}`;
    if (code >= 1273 && code <= 1282) return `11${dayNight}`;
    if (code === 1087) return `11${dayNight}`;
    
    return `01${dayNight}`;
  }

  /**
   * Mapper les langues
   */
  mapLanguage(language) {
    const langMap = {
      'fr': 'fr',
      'en': 'en',
      'es': 'es',
      'de': 'de',
      'it': 'it'
    };
    
    return langMap[language] || 'en';
  }

  /**
   * Vérifier la disponibilité du service
   */
  async checkAvailability() {
    try {
      const response = await axios.get(`${this.baseUrl}/current.json`, {
        params: {
          key: this.apiKey,
          q: 'London'
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
      dailyQuota: 33333, // 1M/mois
      monthlyCost: 0,
      isAvailable: this.isAvailable,
      features: [
        'Données temps réel',
        'Clé API gratuite',
        '1M appels/mois',
        'Couverture mondiale',
        'Prévisions 3 jours'
      ],
      limitations: [
        'Prévisions limitées à 3 jours',
        'Clé API requise'
      ]
    };
  }
}

export default WeatherAPIService;