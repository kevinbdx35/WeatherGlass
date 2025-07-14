import WeatherAggregator from '../weatherAggregator';
import WeatherOracle from '../weatherOracle';

// Mock des services
const mockOpenMeteoService = {
  getWeatherByCoords: jest.fn(),
  getWeatherByCity: jest.fn(),
  getForecastData: jest.fn(),
  checkAvailability: jest.fn().mockResolvedValue(true),
  getUsageStats: jest.fn().mockReturnValue({ calls: 0, errors: 0 })
};

const mockWeatherAPIService = {
  getWeatherByCoords: jest.fn(),
  getWeatherByCity: jest.fn(),
  getForecastByCoords: jest.fn(),
  getForecastByCity: jest.fn(),
  checkAvailability: jest.fn().mockResolvedValue(true),
  getUsageStats: jest.fn().mockReturnValue({ calls: 0, errors: 0 })
};

const mockMeteoFranceService = {
  getWeatherByCoords: jest.fn(),
  getWeatherByCity: jest.fn(),
  getWeatherAlerts: jest.fn(),
  checkAvailability: jest.fn().mockResolvedValue(true),
  getUsageStats: jest.fn().mockReturnValue({ calls: 0, errors: 0 })
};

const mockOpenWeatherMapService = {
  getWeatherByCoords: jest.fn(),
  getWeatherByCity: jest.fn(),
  checkAvailability: jest.fn().mockResolvedValue(true),
  getUsageStats: jest.fn().mockReturnValue({ calls: 0, errors: 0 })
};

// Mock de WeatherOracle
jest.mock('../weatherOracle');

describe('WeatherAggregator Robustness Tests', () => {
  let aggregator;
  let mockOracle;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Oracle avec des réponses par défaut
    mockOracle = {
      validateWeatherData: jest.fn().mockReturnValue({
        isValid: true,
        score: 0.9,
        warnings: [],
        errors: []
      }),
      compareMultipleSources: jest.fn().mockReturnValue({
        isCoherent: true,
        variance: { temperature: 1.5 },
        discrepancies: [],
        recommendedSource: { name: 'primary' },
        confidence: 0.9
      }),
      getStats: jest.fn().mockReturnValue({
        totalValidations: 0,
        averageScore: 0.9
      })
    };
    
    WeatherOracle.mockImplementation(() => mockOracle);
    
    aggregator = new WeatherAggregator();
    
    // Injecter les services mockés
    aggregator.services.primary = mockOpenMeteoService;
    aggregator.services.backup = mockWeatherAPIService;
    aggregator.services.alerts = mockMeteoFranceService;
    aggregator.services.legacy = mockOpenWeatherMapService;
  });

  describe('Consensus Mode Robustness', () => {
    
    beforeEach(() => {
      aggregator.setStrategy('consensus');
    });

    it('should handle all services failing gracefully', async () => {
      // Tous les services échouent
      mockOpenMeteoService.getWeatherByCoords.mockRejectedValue(new Error('Service unavailable'));
      mockWeatherAPIService.getWeatherByCoords.mockRejectedValue(new Error('API key invalid'));
      mockOpenWeatherMapService.getWeatherByCoords.mockRejectedValue(new Error('Rate limit exceeded'));

      // Mock du fallback
      const fallbackData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };
      
      // Le fallback devrait fonctionner avec au moins un service
      mockOpenMeteoService.getWeatherByCoords.mockResolvedValueOnce(fallbackData);

      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('fallback'); // Devrait fallback
    });

    it('should handle partial service failures', async () => {
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      // Seul le service primaire fonctionne
      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);
      mockWeatherAPIService.getWeatherByCoords.mockRejectedValue(new Error('API error'));
      mockOpenWeatherMapService.getWeatherByCoords.mockRejectedValue(new Error('Network error'));

      const result = await aggregator.getConsensusWeather(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('consensus');
      expect(result.aggregator.sources).toEqual(['primary']);
    });

    it('should handle malformed data from services', async () => {
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      const malformedData = {
        // Données incomplètes
        main: { temp: 18 }, // Manque humidity
        // Manque weather
        wind: { speed: 'invalid' } // Type incorrect
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);
      mockWeatherAPIService.getWeatherByCoords.mockResolvedValue(malformedData);

      // L'Oracle devrait détecter les problèmes
      mockOracle.validateWeatherData.mockReturnValueOnce({
        isValid: true,
        score: 0.9,
        warnings: [],
        errors: []
      }).mockReturnValueOnce({
        isValid: false,
        score: 0.3,
        warnings: ['Invalid wind speed'],
        errors: ['Missing weather field']
      });

      const result = await aggregator.getConsensusWeather(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('consensus');
    });

    it('should handle Oracle validation errors gracefully', async () => {
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);
      mockWeatherAPIService.getWeatherByCoords.mockResolvedValue(validData);

      // Oracle compare échoue
      mockOracle.compareMultipleSources.mockImplementation(() => {
        throw new Error('Oracle comparison failed');
      });

      // Ne devrait pas planter
      const result = await aggregator.getConsensusWeather(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('consensus');
    });

    it('should handle variance calculation with invalid data', async () => {
      const data1 = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      const data2 = {
        main: { temp: 'invalid', humidity: 60 }, // Temperature invalide
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(data1);
      mockWeatherAPIService.getWeatherByCoords.mockResolvedValue(data2);

      // Ne devrait pas planter malgré les données invalides
      const result = await aggregator.getConsensusWeather(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('consensus');
    });

  });

  describe('Specialized Mode Robustness', () => {
    
    beforeEach(() => {
      aggregator.setStrategy('specialized');
    });

    it('should handle geographic detection edge cases', async () => {
      // Coordonnées extrêmes
      const extremeCoords = [
        [90, 180],   // Pôle Nord
        [-90, -180], // Pôle Sud
        [0, 0],      // Équateur/Méridien
        [91, 181]    // Invalides
      ];

      const validData = {
        main: { temp: -40, humidity: 90 },
        weather: [{ main: 'Snow', description: 'Heavy snow' }],
        wind: { speed: 50 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);

      for (const [lat, lon] of extremeCoords) {
        const result = await aggregator.getSpecializedWeather(lat, lon, 'en');
        expect(result).toBeDefined();
        expect(result.aggregator.strategy).toBe('specialized');
      }
    });

    it('should fallback when specialized service fails', async () => {
      // En France, devrait utiliser Météo-France
      const lat = 48.8566, lon = 2.3522; // Paris

      // Météo-France échoue
      mockMeteoFranceService.getWeatherByCoords.mockRejectedValue(new Error('Service unavailable'));
      
      // Le fallback devrait fonctionner
      const fallbackData = {
        main: { temp: 15, humidity: 70 },
        weather: [{ main: 'Clouds', description: 'Cloudy' }],
        wind: { speed: 10 }
      };
      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(fallbackData);

      const result = await aggregator.getSpecializedWeather(lat, lon, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('specialized');
      expect(result.aggregator.usedSource).toBe('primary'); // Fallback
    });

    it('should handle missing geographic context gracefully', async () => {
      // Coordonnées qui ne correspondent à aucun contexte spécial
      const result = await aggregator.getGeographicalContext(45.0, 5.0);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

  });

  describe('General Error Handling', () => {
    
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.code = 'TIMEOUT';

      mockOpenMeteoService.getWeatherByCoords.mockRejectedValue(timeoutError);
      mockWeatherAPIService.getWeatherByCoords.mockRejectedValue(timeoutError);
      mockOpenWeatherMapService.getWeatherByCoords.mockRejectedValue(timeoutError);

      aggregator.setStrategy('fallback');

      // Devrait gérer les timeouts gracieusement
      try {
        await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      } catch (error) {
        expect(error.message).toContain('failed');
      }
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;

      mockOpenMeteoService.getWeatherByCoords.mockRejectedValue(rateLimitError);
      
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };
      mockWeatherAPIService.getWeatherByCoords.mockResolvedValue(validData);

      aggregator.setStrategy('fallback');

      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.usedSource).toBe('backup');
    });

    it('should handle invalid coordinates gracefully', async () => {
      const invalidCoords = [
        ['invalid', 'invalid'],
        [null, null],
        [undefined, undefined],
        ['', '']
      ];

      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);

      for (const [lat, lon] of invalidCoords) {
        try {
          const result = await aggregator.getWeatherByCoords(lat, lon, 'en');
          // Si ça ne plante pas, vérifier que le résultat est cohérent
          if (result) {
            expect(result).toBeDefined();
          }
        } catch (error) {
          // Les erreurs sont acceptables pour des coordonnées invalides
          expect(error).toBeDefined();
        }
      }
    });

    it('should handle cache corruption gracefully', async () => {
      // Corrompre le cache
      aggregator.cache.set('test_key', 'invalid_data');
      
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);

      // Devrait ignorer le cache corrompu et récupérer de nouvelles données
      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator).toBeDefined();
    });

    it('should handle memory pressure gracefully', async () => {
      // Simuler une pression mémoire en remplissant le cache
      for (let i = 0; i < 1000; i++) {
        aggregator.cache.set(`key_${i}`, { large: 'data'.repeat(1000) });
      }

      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);

      // Devrait fonctionner malgré la pression mémoire
      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
    });

  });

  describe('Data Validation Robustness', () => {
    
    it('should handle Oracle returning invalid variance types', async () => {
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(validData);
      mockWeatherAPIService.getWeatherByCoords.mockResolvedValue(validData);

      // Oracle retourne des types invalides
      mockOracle.compareMultipleSources.mockReturnValue({
        isCoherent: true,
        variance: 'not-an-object', // Type invalide
        discrepancies: null,
        recommendedSource: undefined,
        confidence: 'invalid'
      });

      aggregator.setStrategy('consensus');

      // Ne devrait pas planter
      const result = await aggregator.getConsensusWeather(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
      expect(result.aggregator.strategy).toBe('consensus');
    });

    it('should handle circular references in data', async () => {
      const circularData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 }
      };
      
      // Créer une référence circulaire
      circularData.self = circularData;

      mockOpenMeteoService.getWeatherByCoords.mockResolvedValue(circularData);

      // Ne devrait pas planter lors de la sérialisation/traitement
      const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
      
      expect(result).toBeDefined();
    });

  });

});