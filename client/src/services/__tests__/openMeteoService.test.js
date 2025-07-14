import OpenMeteoService from '../openMeteoService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios;

describe('OpenMeteoService', () => {
  let service;

  beforeEach(() => {
    service = new OpenMeteoService();
    jest.clearAllMocks();
  });

  describe('getWeatherByCoords', () => {
    it('should fetch weather data by coordinates', async () => {
      const mockResponse = {
        data: {
          current: {
            temperature_2m: 20,
            relative_humidity_2m: 60,
            apparent_temperature: 22,
            precipitation: 0,
            wind_speed_10m: 10,
            wind_direction_10m: 180,
            weather_code: 0
          },
          daily: {
            time: ['2024-01-01', '2024-01-02'],
            weather_code: [0, 1],
            temperature_2m_max: [25, 23],
            temperature_2m_min: [15, 13],
            precipitation_sum: [0, 2],
            wind_speed_10m_max: [12, 14]
          },
          timezone_abbreviation: 'CET'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherByCoords(48.8566, 2.3522, 'en');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            latitude: 48.8566,
            longitude: 2.3522,
            timezone: 'auto',
            forecast_days: 7
          })
        })
      );

      expect(result).toHaveProperty('coord');
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('main');
      expect(result).toHaveProperty('wind');
      expect(result.source).toBe('Open-Meteo');
      expect(result.main.temp).toBe(20);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getWeatherByCoords(48.8566, 2.3522))
        .rejects.toThrow('Open-Meteo: Network error');
    });
  });

  describe('getWeatherByCity', () => {
    it('should geocode city and fetch weather data', async () => {
      const geocodeResponse = {
        data: {
          results: [{
            latitude: 48.8566,
            longitude: 2.3522,
            name: 'Paris',
            country_code: 'FR'
          }]
        }
      };

      const weatherResponse = {
        data: {
          current: {
            temperature_2m: 18,
            relative_humidity_2m: 65,
            apparent_temperature: 20,
            precipitation: 0,
            wind_speed_10m: 8,
            wind_direction_10m: 90,
            weather_code: 1
          },
          daily: {
            time: ['2024-01-01'],
            weather_code: [1],
            temperature_2m_max: [22],
            temperature_2m_min: [14],
            precipitation_sum: [0],
            wind_speed_10m_max: [10]
          }
        }
      };

      mockedAxios.get
        .mockResolvedValueOnce(geocodeResponse)
        .mockResolvedValueOnce(weatherResponse);

      const result = await service.getWeatherByCity('Paris', 'fr');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://geocoding-api.open-meteo.com/v1/search',
        expect.objectContaining({
          params: expect.objectContaining({
            name: 'Paris',
            count: 1
          })
        })
      );

      expect(result.main.temp).toBe(18);
      expect(result.source).toBe('Open-Meteo');
    });

    it('should handle city not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { results: [] }
      });

      await expect(service.getWeatherByCity('UnknownCity'))
        .rejects.toThrow('City not found');
    });
  });

  describe('mapWeatherCode', () => {
    it('should map weather codes correctly', () => {
      expect(service.mapWeatherCode(0)).toEqual(
        expect.objectContaining({ id: 800, main: 'Clear' })
      );
      expect(service.mapWeatherCode(1)).toEqual(
        expect.objectContaining({ id: 801, main: 'Clouds' })
      );
      expect(service.mapWeatherCode(61)).toEqual(
        expect.objectContaining({ id: 500, main: 'Rain' })
      );
      expect(service.mapWeatherCode(95)).toEqual(
        expect.objectContaining({ id: 200, main: 'Thunderstorm' })
      );
    });

    it('should handle unknown weather codes', () => {
      const result = service.mapWeatherCode(999);
      expect(result).toEqual(
        expect.objectContaining({ id: 800, main: 'Clear' })
      );
    });
  });

  describe('checkAvailability', () => {
    it('should check service availability', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200 });

      const result = await service.checkAvailability();

      expect(result).toBe(true);
      expect(service.isAvailable).toBe(true);
    });

    it('should handle unavailable service', async () => {
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
        name: 'Open-Meteo',
        dailyQuota: 10000,
        monthlyCost: 0,
        isAvailable: true,
        features: [
          'Données ECMWF',
          'Pas de clé API',
          '10k appels/jour',
          'Couverture mondiale',
          'Géocodage gratuit'
        ]
      });
    });
  });
});