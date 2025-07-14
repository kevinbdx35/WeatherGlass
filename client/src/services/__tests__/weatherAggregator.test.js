import WeatherAggregator from '../weatherAggregator';
import OpenMeteoService from '../openMeteoService';
import WeatherAPIService from '../weatherAPIService';
import MeteoFranceService from '../meteoFranceService';

jest.mock('../openMeteoService');
jest.mock('../weatherAPIService');
jest.mock('../meteoFranceService');

describe('WeatherAggregator', () => {
  let aggregator;
  let mockPrimaryService;
  let mockBackupService;
  let mockAlertsService;
  let mockLegacyService;

  beforeEach(() => {
    mockPrimaryService = {
      getWeatherByCoords: jest.fn(),
      getWeatherByCity: jest.fn(),
      getForecastData: jest.fn(),
      checkAvailability: jest.fn(),
      getUsageStats: jest.fn()
    };

    mockBackupService = {
      getWeatherByCoords: jest.fn(),
      getWeatherByCity: jest.fn(),
      getForecastByCity: jest.fn(),
      getForecastByCoords: jest.fn(),
      checkAvailability: jest.fn(),
      getUsageStats: jest.fn()
    };

    mockAlertsService = {
      getWeatherAlerts: jest.fn(),
      checkAvailability: jest.fn(),
      getUsageStats: jest.fn()
    };

    mockLegacyService = {
      getWeatherByCoords: jest.fn(),
      getWeatherByCity: jest.fn(),
      checkAvailability: jest.fn(),
      getUsageStats: jest.fn()
    };

    OpenMeteoService.mockImplementation(() => mockPrimaryService);
    WeatherAPIService.mockImplementation(() => mockBackupService);
    MeteoFranceService.mockImplementation(() => mockAlertsService);

    aggregator = new WeatherAggregator();
    aggregator.setLegacyService(mockLegacyService);

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct default strategy', () => {
      expect(aggregator.strategy).toBe('fallback');
    });

    it('should initialize usage stats', () => {
      const stats = aggregator.getUsageStats();
      expect(stats.daily_calls).toEqual({
        primary: 0,
        backup: 0,
        alerts: 0,
        legacy: 0
      });
    });
  });

  describe('setStrategy', () => {
    it('should change aggregation strategy', () => {
      aggregator.setStrategy('consensus');
      expect(aggregator.strategy).toBe('consensus');
    });
  });

  describe('getFallbackWeather', () => {
    const mockWeatherData = {
      coord: { lat: 48.8566, lon: 2.3522 },
      main: { temp: 20, humidity: 60 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
      wind: { speed: 5, deg: 180 },
      name: 'Paris'
    };

    it('should use primary service first', async () => {
      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
      mockAlertsService.getWeatherAlerts.mockResolvedValueOnce([]);

      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(mockPrimaryService.getWeatherByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'en');
      expect(result.aggregator.usedSource).toBe('primary');
      expect(result.aggregator.strategy).toBe('fallback');
    });

    it('should fallback to backup service when primary fails', async () => {
      mockPrimaryService.getWeatherByCoords.mockRejectedValueOnce(new Error('Primary failed'));
      mockBackupService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
      mockAlertsService.getWeatherAlerts.mockResolvedValueOnce([]);

      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(mockBackupService.getWeatherByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'en');
      expect(result.aggregator.usedSource).toBe('backup');
    });

    it('should fallback to legacy service when others fail', async () => {
      mockPrimaryService.getWeatherByCoords.mockRejectedValueOnce(new Error('Primary failed'));
      mockBackupService.getWeatherByCoords.mockRejectedValueOnce(new Error('Backup failed'));
      mockLegacyService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);

      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(mockLegacyService.getWeatherByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'en');
      expect(result.aggregator.usedSource).toBe('legacy');
    });

    it('should throw error when all services fail', async () => {
      mockPrimaryService.getWeatherByCoords.mockRejectedValueOnce(new Error('Primary failed'));
      mockBackupService.getWeatherByCoords.mockRejectedValueOnce(new Error('Backup failed'));
      mockLegacyService.getWeatherByCoords.mockRejectedValueOnce(new Error('Legacy failed'));

      await expect(aggregator.getFallbackWeather(48.8566, 2.3522, 'en'))
        .rejects.toThrow('All weather services failed');
    });

    it('should add French alerts for French coordinates', async () => {
      const frenchAlerts = [{
        level: 3,
        levelName: 'Orange',
        type: 'pluie',
        description: 'Fortes précipitations'
      }];

      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
      mockAlertsService.getWeatherAlerts.mockResolvedValueOnce(frenchAlerts);

      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(result.alerts).toEqual(frenchAlerts);
      expect(result.hasOfficialAlerts).toBe(true);
    });

    it('should handle alerts service failure gracefully', async () => {
      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
      mockAlertsService.getWeatherAlerts.mockRejectedValueOnce(new Error('Alerts failed'));

      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(result.alerts).toEqual([]);
      expect(result.hasOfficialAlerts).toBe(false);
    });
  });

  describe('getFallbackWeatherByCity', () => {
    it('should prioritize Météo France for French cities', async () => {
      const mockWeatherData = { name: 'Paris', main: { temp: 18 } };
      mockAlertsService.getWeatherByCity = jest.fn().mockResolvedValueOnce(mockWeatherData);

      const result = await aggregator.getFallbackWeatherByCity('Paris', 'fr');

      expect(mockAlertsService.getWeatherByCity).toHaveBeenCalledWith('Paris', 'fr');
      expect(result.aggregator.usedSource).toBe('alerts');
    });

    it('should use normal priority for non-French cities', async () => {
      const mockWeatherData = { 
        name: 'London', 
        main: { temp: 15 }, 
        coord: { lat: 51.5074, lon: -0.1278 } 
      };
      mockPrimaryService.getWeatherByCity.mockResolvedValueOnce(mockWeatherData);

      const result = await aggregator.getFallbackWeatherByCity('London', 'en');

      expect(mockPrimaryService.getWeatherByCity).toHaveBeenCalledWith('London', 'en');
      expect(result.aggregator.usedSource).toBe('primary');
    });
  });

  describe('getConsensusWeather', () => {
    it('should combine data from multiple sources', async () => {
      const weatherData1 = { main: { temp: 18, humidity: 60 }, wind: { speed: 5 } };
      const weatherData2 = { main: { temp: 20, humidity: 65 }, wind: { speed: 7 } };
      const weatherData3 = { main: { temp: 22, humidity: 70 }, wind: { speed: 3 } };

      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(weatherData1);
      mockBackupService.getWeatherByCoords.mockResolvedValueOnce(weatherData2);
      mockLegacyService.getWeatherByCoords.mockResolvedValueOnce(weatherData3);

      aggregator.setStrategy('consensus');
      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'en');

      expect(result.aggregator.strategy).toBe('consensus');
      expect(result.aggregator.sources).toHaveLength(3);
      expect(result.main.temp).toBe(20); // Average of 18, 20, 22
      expect(result.main.humidity).toBe(65); // Average of 60, 65, 70
    });

    it('should handle partial failures in consensus mode', async () => {
      const weatherData = { main: { temp: 18, humidity: 60 }, wind: { speed: 5 } };

      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(weatherData);
      mockBackupService.getWeatherByCoords.mockRejectedValueOnce(new Error('Failed'));
      mockLegacyService.getWeatherByCoords.mockResolvedValueOnce(weatherData);

      aggregator.setStrategy('consensus');
      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'en');

      expect(result.aggregator.sources).toHaveLength(2);
      expect(result.aggregator.strategy).toBe('consensus');
    });
  });

  describe('calculateConsensus', () => {
    it('should calculate average values correctly', () => {
      const results = [
        { data: { main: { temp: 18, humidity: 60 }, wind: { speed: 5 } } },
        { data: { main: { temp: 22, humidity: 70 }, wind: { speed: 7 } } }
      ];

      const consensus = aggregator.calculateConsensus(results);

      expect(consensus.main.temp).toBe(20); // (18 + 22) / 2
      expect(consensus.main.humidity).toBe(65); // (60 + 70) / 2
      expect(consensus.wind.speed).toBe(6); // (5 + 7) / 2
    });

    it('should return single result when only one source', () => {
      const results = [
        { data: { main: { temp: 18, humidity: 60 }, wind: { speed: 5 } } }
      ];

      const consensus = aggregator.calculateConsensus(results);

      expect(consensus).toBe(results[0].data);
    });
  });

  describe('calculateAgreement', () => {
    it('should calculate high agreement for close temperatures', () => {
      const results = [
        { data: { main: { temp: 19 } } },
        { data: { main: { temp: 20 } } },
        { data: { main: { temp: 21 } } }
      ];

      const agreement = aggregator.calculateAgreement(results);

      expect(agreement).toBe(0.85); // Temperature range is 2°C
    });

    it('should calculate low agreement for divergent temperatures', () => {
      const results = [
        { data: { main: { temp: 10 } } },
        { data: { main: { temp: 20 } } },
        { data: { main: { temp: 30 } } }
      ];

      const agreement = aggregator.calculateAgreement(results);

      expect(agreement).toBe(0.5); // Temperature range is 20°C
    });

    it('should return 1.0 for single result', () => {
      const results = [{ data: { main: { temp: 20 } } }];

      const agreement = aggregator.calculateAgreement(results);

      expect(agreement).toBe(1.0);
    });
  });

  describe('isInFrance', () => {
    it('should correctly identify French coordinates', () => {
      expect(aggregator.isInFrance(48.8566, 2.3522)).toBe(true); // Paris
      expect(aggregator.isInFrance(43.2965, 5.3698)).toBe(true); // Marseille
      expect(aggregator.isInFrance(51.5074, -0.1278)).toBe(false); // London
    });
  });

  describe('isLikelyFrenchCity', () => {
    it('should identify major French cities', () => {
      expect(aggregator.isLikelyFrenchCity('Paris')).toBe(true);
      expect(aggregator.isLikelyFrenchCity('Marseille')).toBe(true);
      expect(aggregator.isLikelyFrenchCity('London')).toBe(false);
      expect(aggregator.isLikelyFrenchCity('New York')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(aggregator.isLikelyFrenchCity('PARIS')).toBe(true);
      expect(aggregator.isLikelyFrenchCity('lyon')).toBe(true);
    });
  });

  describe('calculateConfidence', () => {
    it('should return correct confidence scores', () => {
      expect(aggregator.calculateConfidence('primary')).toBe(0.9);
      expect(aggregator.calculateConfidence('backup')).toBe(0.85);
      expect(aggregator.calculateConfidence('alerts')).toBe(0.95);
      expect(aggregator.calculateConfidence('legacy')).toBe(0.8);
      expect(aggregator.calculateConfidence('unknown')).toBe(0.7);
    });
  });

  describe('resetDailyStatsIfNeeded', () => {
    it('should reset stats on new day', () => {
      aggregator.usageStats.calls.primary = 100;
      aggregator.usageStats.lastReset = '2023-01-01';

      aggregator.resetDailyStatsIfNeeded();

      expect(aggregator.usageStats.calls.primary).toBe(0);
      expect(aggregator.usageStats.lastReset).toBe(new Date().toDateString());
    });

    it('should not reset stats on same day', () => {
      aggregator.usageStats.calls.primary = 100;
      aggregator.usageStats.lastReset = new Date().toDateString();

      aggregator.resetDailyStatsIfNeeded();

      expect(aggregator.usageStats.calls.primary).toBe(100);
    });
  });

  describe('checkHealth', () => {
    it('should check all services health', async () => {
      mockPrimaryService.checkAvailability.mockResolvedValueOnce(true);
      mockBackupService.checkAvailability.mockResolvedValueOnce(true);
      mockAlertsService.checkAvailability.mockResolvedValueOnce(false);
      mockLegacyService.checkAvailability.mockResolvedValueOnce(true);

      const health = await aggregator.checkHealth();

      expect(health).toEqual({
        primary: true,
        backup: true,
        alerts: false,
        legacy: true
      });
    });
  });

  describe('getForecastData', () => {
    it('should get forecast data from primary service with raw_data', async () => {
      const mockWeatherData = {
        main: { temp: 20 },
        raw_data: {
          daily: {
            time: ['2024-01-01', '2024-01-02'],
            weather_code: [0, 1],
            temperature_2m_max: [25, 23],
            temperature_2m_min: [15, 13],
            precipitation_sum: [0, 2],
            wind_speed_10m_max: [12, 14]
          }
        }
      };
      
      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
      mockPrimaryService.getForecastData.mockReturnValueOnce([
        { date: new Date('2024-01-01'), maxTemp: 25, minTemp: 15 },
        { date: new Date('2024-01-02'), maxTemp: 23, minTemp: 13 }
      ]);

      const result = await aggregator.getForecastData({ lat: 48.8566, lon: 2.3522 }, 'en');

      expect(mockPrimaryService.getWeatherByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'en');
      expect(mockPrimaryService.getForecastData).toHaveBeenCalledWith(mockWeatherData);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should fallback to backup service when primary fails', async () => {
      mockPrimaryService.getWeatherByCoords.mockRejectedValueOnce(new Error('Primary failed'));
      mockBackupService.getForecastByCoords.mockResolvedValueOnce([
        { date: new Date('2024-01-01'), maxTemp: 22, minTemp: 12 }
      ]);

      const result = await aggregator.getForecastData({ lat: 48.8566, lon: 2.3522 }, 'en');

      expect(mockBackupService.getForecastByCoords).toHaveBeenCalledWith(48.8566, 2.3522, 'en');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle city name input', async () => {
      const mockWeatherData = {
        main: { temp: 18 },
        raw_data: {
          daily: {
            time: ['2024-01-01'],
            weather_code: [0],
            temperature_2m_max: [22],
            temperature_2m_min: [14],
            precipitation_sum: [0],
            wind_speed_10m_max: [10]
          }
        }
      };
      
      mockPrimaryService.getWeatherByCity.mockResolvedValueOnce(mockWeatherData);
      mockPrimaryService.getForecastData.mockReturnValueOnce([
        { date: new Date('2024-01-01'), maxTemp: 22, minTemp: 14 }
      ]);

      const result = await aggregator.getForecastData('Paris', 'fr');

      expect(mockPrimaryService.getWeatherByCity).toHaveBeenCalledWith('Paris', 'fr');
      expect(result).toHaveLength(1);
    });
  });

  describe('caching', () => {
    it('should cache and return cached results', async () => {
      const mockWeatherData = { main: { temp: 20 }, name: 'Paris' };
      mockPrimaryService.getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);

      // First call
      await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');
      
      // Second call should use cache
      const result = await aggregator.getFallbackWeather(48.8566, 2.3522, 'en');

      expect(mockPrimaryService.getWeatherByCoords).toHaveBeenCalledTimes(1);
      expect(result.main.temp).toBe(20);
    });

    it('should clear cache', () => {
      aggregator.cache.set('test', 'data');
      expect(aggregator.cache.size).toBe(1);

      aggregator.clearCache();
      expect(aggregator.cache.size).toBe(0);
    });
  });
});