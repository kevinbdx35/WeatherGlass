import WeatherAPIService from '../weatherAPIService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios;

describe('WeatherAPIService', () => {
  let service;

  beforeEach(() => {
    service = new WeatherAPIService();
    jest.clearAllMocks();
  });

  describe('getWeatherByCoords', () => {
    it('should fetch weather data by coordinates', async () => {
      const mockResponse = {
        data: {
          location: {
            lat: 48.8566,
            lon: 2.3522,
            name: 'Paris',
            country: 'France',
            tz_id: 'Europe/Paris'
          },
          current: {
            temp_c: 18,
            feelslike_c: 20,
            humidity: 65,
            pressure_mb: 1013,
            wind_kph: 15,
            wind_degree: 180,
            cloud: 25,
            vis_km: 10,
            uv: 3,
            gust_kph: 20,
            is_day: 1,
            condition: {
              code: 1000,
              text: 'Sunny'
            },
            last_updated_epoch: 1640995200
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherByCoords(48.8566, 2.3522, 'en');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/current.json',
        expect.objectContaining({
          params: expect.objectContaining({
            key: expect.any(String),
            q: '48.8566,2.3522',
            aqi: 'no',
            lang: 'en'
          })
        })
      );

      expect(result).toHaveProperty('coord');
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('main');
      expect(result).toHaveProperty('wind');
      expect(result.source).toBe('WeatherAPI');
      expect(result.main.temp).toBe(18);
      expect(result.uv_index).toBe(3);
    });

    it('should handle invalid API key error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 },
        message: 'Unauthorized'
      });

      await expect(service.getWeatherByCoords(48.8566, 2.3522))
        .rejects.toThrow('WeatherAPI: Invalid API key');
    });
  });

  describe('getWeatherByCity', () => {
    it('should fetch weather data by city name', async () => {
      const mockResponse = {
        data: {
          location: {
            lat: 51.5074,
            lon: -0.1278,
            name: 'London',
            country: 'United Kingdom',
            tz_id: 'Europe/London'
          },
          current: {
            temp_c: 15,
            feelslike_c: 13,
            humidity: 72,
            pressure_mb: 1015,
            wind_kph: 12,
            wind_degree: 250,
            cloud: 40,
            vis_km: 8,
            uv: 2,
            gust_kph: 18,
            is_day: 1,
            condition: {
              code: 1003,
              text: 'Partly cloudy'
            },
            last_updated_epoch: 1640995200
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherByCity('London', 'en');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/current.json',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'London',
            lang: 'en'
          })
        })
      );

      expect(result.name).toBe('London');
      expect(result.main.temp).toBe(15);
    });

    it('should handle city not found error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 400 },
        message: 'Bad Request'
      });

      await expect(service.getWeatherByCity('UnknownCity'))
        .rejects.toThrow('City not found');
    });
  });

  describe('getForecastByCoords', () => {
    it('should fetch forecast data by coordinates', async () => {
      const mockResponse = {
        data: {
          forecast: {
            forecastday: [{
              date: '2024-01-01',
              day: {
                maxtemp_c: 20,
                mintemp_c: 10
              },
              hour: [{
                time: '2024-01-01 12:00',
                time_epoch: 1704110400,
                temp_c: 18,
                humidity: 65,
                pressure_mb: 1013,
                wind_kph: 15,
                wind_degree: 180,
                precip_mm: 0,
                is_day: 1,
                condition: {
                  code: 1000,
                  text: 'Sunny'
                }
              }]
            }]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getForecastByCoords(48.8566, 2.3522, 'en');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.weatherapi.com/v1/forecast.json',
        expect.objectContaining({
          params: expect.objectContaining({
            q: '48.8566,2.3522',
            days: 3
          })
        })
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('dt');
      expect(result[0]).toHaveProperty('main');
      expect(result[0]).toHaveProperty('weather');
    });
  });

  describe('mapWeatherCondition', () => {
    it('should map weather conditions correctly', () => {
      expect(service.mapWeatherCondition(1000)).toBe(800); // Sunny
      expect(service.mapWeatherCondition(1003)).toBe(801); // Partly cloudy
      expect(service.mapWeatherCondition(1063)).toBe(500); // Rain possible
      expect(service.mapWeatherCondition(1087)).toBe(200); // Thundery
      expect(service.mapWeatherCondition(1225)).toBe(602); // Heavy snow
    });

    it('should handle unknown condition codes', () => {
      expect(service.mapWeatherCondition(9999)).toBe(800);
    });
  });

  describe('getMainWeatherGroup', () => {
    it('should return correct weather groups', () => {
      expect(service.getMainWeatherGroup(1000)).toBe('Clear');
      expect(service.getMainWeatherGroup(1003)).toBe('Clouds');
      expect(service.getMainWeatherGroup(1180)).toBe('Rain');
      expect(service.getMainWeatherGroup(1210)).toBe('Rain'); // 1210 falls in range 1180-1246 first
      expect(service.getMainWeatherGroup(1273)).toBe('Thunderstorm');
      expect(service.getMainWeatherGroup(1250)).toBe('Snow'); // Test actual snow range
    });
  });

  describe('mapWeatherIcon', () => {
    it('should map icons correctly for day and night', () => {
      expect(service.mapWeatherIcon(1000, 1)).toBe('01d');
      expect(service.mapWeatherIcon(1000, 0)).toBe('01n');
      expect(service.mapWeatherIcon(1003, 1)).toBe('02d');
      expect(service.mapWeatherIcon(1180, 0)).toBe('09n'); // 1180 falls in range 1150-1201 which maps to 09
    });
  });

  describe('mapLanguage', () => {
    it('should map supported languages', () => {
      expect(service.mapLanguage('fr')).toBe('fr');
      expect(service.mapLanguage('en')).toBe('en');
      expect(service.mapLanguage('es')).toBe('es');
      expect(service.mapLanguage('unknown')).toBe('en');
    });
  });

  describe('checkAvailability', () => {
    it('should check service availability', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const result = await service.checkAvailability();

      expect(result).toBe(true);
      expect(service.isAvailable).toBe(true);
    });

    it('should handle service unavailability', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Service down'));

      const result = await service.checkAvailability();

      expect(result).toBe(false);
      expect(service.isAvailable).toBe(false);
    });
  });

  describe('getUsageStats', () => {
    it('should return correct usage statistics', () => {
      const stats = service.getUsageStats();

      expect(stats).toEqual({
        name: 'WeatherAPI',
        dailyQuota: 33333,
        monthlyCost: 0,
        isAvailable: true,
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
      });
    });
  });
});