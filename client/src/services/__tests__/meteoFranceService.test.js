import MeteoFranceService from '../meteoFranceService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios;

describe('MeteoFranceService', () => {
  let service;

  beforeEach(() => {
    service = new MeteoFranceService();
    jest.clearAllMocks();
  });

  describe('getWeatherByCoords', () => {
    it('should fetch weather data for French coordinates', async () => {
      const mockResponse = {
        data: {
          observations: [{
            temperature: 22,
            humidity: 60,
            pressure: 1015,
            wind_speed: 15,
            wind_direction: 180,
            description: 'Beau temps'
          }]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherByCoords(48.8566, 2.3522, 'fr');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://portail-api.meteofrance.fr/public/DPObs/v1/observations/spatio-temporelles/horaires',
        expect.objectContaining({
          params: expect.objectContaining({
            'api-key': expect.any(String),
            lat: 48.8566,
            lon: 2.3522,
            format: 'json'
          })
        })
      );

      expect(result).toHaveProperty('coord');
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('main');
      expect(result.source).toBe('Météo France');
      expect(result.official).toBe(true);
      expect(result.main.temp).toBe(22);
    });

    it('should reject coordinates outside France', async () => {
      await expect(service.getWeatherByCoords(40.7128, -74.0060)) // New York
        .rejects.toThrow('Location not in France');
    });
  });

  describe('getWeatherByCity', () => {
    it('should fetch weather data for French cities', async () => {
      const mockResponse = {
        data: {
          observations: [{
            temperature: 18,
            humidity: 65,
            pressure: 1013,
            wind_speed: 12,
            wind_direction: 90
          }]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherByCity('Paris', 'fr');

      expect(result.main.temp).toBe(18);
      expect(result.name).toBe('France');
    });

    it('should handle unknown French cities', async () => {
      await expect(service.getWeatherByCity('UnknownFrenchCity'))
        .rejects.toThrow('French city "UnknownFrenchCity" not found');
    });
  });

  describe('getWeatherAlerts', () => {
    it('should fetch weather alerts', async () => {
      const mockResponse = {
        data: {
          vigilances: [{
            niveau: 3,
            type: 'pluie',
            message: 'Fortes précipitations attendues',
            debut: '2024-01-01T06:00:00Z',
            fin: '2024-01-01T18:00:00Z'
          }, {
            niveau: 1, // Should be filtered out
            type: 'vent',
            message: 'Vent faible'
          }]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getWeatherAlerts();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://portail-api.meteofrance.fr/public/DPVigilance/v1/vigilance/metropole',
        expect.objectContaining({
          params: expect.objectContaining({
            'api-key': expect.any(String),
            format: 'json'
          })
        })
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1); // Only level 3 alert should be included
      expect(result[0]).toEqual({
        level: 3,
        levelName: 'Orange',
        type: 'pluie',
        description: 'Fortes précipitations attendues',
        startTime: '2024-01-01T06:00:00Z',
        endTime: '2024-01-01T18:00:00Z',
        color: '#f97316',
        official: true,
        source: 'Météo France'
      });
    });

    it('should return empty array when no alerts', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { vigilances: [] }
      });

      const result = await service.getWeatherAlerts();

      expect(result).toEqual([]);
    });
  });

  describe('searchFrenchCity', () => {
    it('should find major French cities', async () => {
      const result = await service.searchFrenchCity('Paris');

      expect(result).toEqual({
        lat: 48.8566,
        lon: 2.3522,
        name: 'Paris'
      });
    });

    it('should find cities case-insensitively', async () => {
      const result = await service.searchFrenchCity('LYON');

      expect(result.name).toBe('Lyon');
      expect(result.lat).toBe(45.7640);
    });

    it('should handle cities with special characters', async () => {
      const result = await service.searchFrenchCity('aix-en-provence');

      expect(result.name).toBe('Aix-en-Provence');
    });
  });

  describe('isInFrance', () => {
    it('should correctly identify French coordinates', () => {
      expect(service.isInFrance(48.8566, 2.3522)).toBe(true); // Paris
      expect(service.isInFrance(43.2965, 5.3698)).toBe(true); // Marseille
      expect(service.isInFrance(45.7640, 4.8357)).toBe(true); // Lyon
    });

    it('should reject non-French coordinates', () => {
      expect(service.isInFrance(51.5074, -0.1278)).toBe(false); // London
      expect(service.isInFrance(40.7128, -74.0060)).toBe(false); // New York
      expect(service.isInFrance(52.5200, 13.4050)).toBe(false); // Berlin
    });
  });

  describe('getAlertLevelName', () => {
    it('should return correct alert level names', () => {
      expect(service.getAlertLevelName(1)).toBe('Vert');
      expect(service.getAlertLevelName(2)).toBe('Jaune');
      expect(service.getAlertLevelName(3)).toBe('Orange');
      expect(service.getAlertLevelName(4)).toBe('Rouge');
      expect(service.getAlertLevelName(5)).toBe('Inconnu');
    });
  });

  describe('getAlertColor', () => {
    it('should return correct alert colors', () => {
      expect(service.getAlertColor(1)).toBe('#4ade80');
      expect(service.getAlertColor(2)).toBe('#facc15');
      expect(service.getAlertColor(3)).toBe('#f97316');
      expect(service.getAlertColor(4)).toBe('#ef4444');
      expect(service.getAlertColor(5)).toBe('#6b7280');
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
        name: 'Météo France',
        dailyQuota: 500,
        monthlyCost: 0,
        isAvailable: true,
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
      });
    });
  });
});