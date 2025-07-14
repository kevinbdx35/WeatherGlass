import { renderHook, act, waitFor } from '@testing-library/react';
import useWeatherData from '../useWeatherData';

// Mock des services et composants
jest.mock('../../utils/weatherCache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
    has: jest.fn().mockReturnValue(false)
  }));
});

jest.mock('../../services/weatherAggregator');
jest.mock('../../services/openWeatherMapService');

const mockWeatherAggregator = {
  getWeatherByCoords: jest.fn(),
  getWeatherByCity: jest.fn(),
  getForecastData: jest.fn(),
  setLegacyService: jest.fn(),
  setStrategy: jest.fn(),
  strategy: 'fallback'
};

const mockOpenWeatherMapService = jest.fn();

describe('useWeatherData Robustness Tests', () => {
  
  const mockT = jest.fn((key, params) => {
    const translations = {
      'search.errors.networkError': 'Network error',
      'search.errors.authError': 'Authentication error',
      'search.errors.cityNotFound': 'City not found',
      'common.error': 'An error occurred'
    };
    
    let result = translations[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{{${param}}}`, params[param]);
      });
    }
    return result;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock constructor to return our mock instance
    require('../../services/weatherAggregator').default.mockImplementation(() => mockWeatherAggregator);
    require('../../services/openWeatherMapService').default.mockImplementation(() => mockOpenWeatherMapService);
  });

  describe('Error Handling', () => {
    
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      
      mockWeatherAggregator.getWeatherByCoords.mockRejectedValue(networkError);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        try {
          await result.current.fetchWeatherByCoords(48.8566, 2.3522);
        } catch (error) {
          // Expected to catch error
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle API authentication errors', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      
      mockWeatherAggregator.getWeatherByCity.mockRejectedValue(authError);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        try {
          await result.current.fetchWeatherByCity('London');
        } catch (error) {
          // Expected to catch error
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Authentication error');
    });

    it('should handle city not found errors', async () => {
      const notFoundError = new Error('City not found');
      notFoundError.response = { status: 404 };
      
      mockWeatherAggregator.getWeatherByCity.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        try {
          await result.current.fetchWeatherByCity('NonExistentCity');
        } catch (error) {
          // Expected to catch error
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('City not found');
    });

    it('should handle malformed API responses', async () => {
      const malformedData = {
        // Missing required fields
        name: 'Paris',
        // No main, weather, wind, etc.
      };
      
      mockWeatherAggregator.getWeatherByCoords.mockResolvedValue(malformedData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCoords(48.8566, 2.3522);
      });

      // Should complete without crashing
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(malformedData);
    });

    it('should handle forecast data errors gracefully', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);
      mockWeatherAggregator.getForecastData.mockRejectedValue(new Error('Forecast unavailable'));

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Weather data should be available even if forecast fails
      expect(result.current.data).toEqual(validWeatherData);
      expect(result.current.forecastData).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle invalid forecast data structures', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      const invalidForecastData = {
        // Not an array and missing expected properties
        invalid: 'structure'
      };

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);
      mockWeatherAggregator.getForecastData.mockResolvedValue(invalidForecastData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Should handle invalid forecast gracefully
      expect(result.current.data).toEqual(validWeatherData);
      expect(result.current.forecastData).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

  });

  describe('Strategy Management', () => {
    
    it('should handle strategy changes safely', async () => {
      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        result.current.setStrategy('consensus');
      });

      expect(mockWeatherAggregator.setStrategy).toHaveBeenCalledWith('consensus');
    });

    it('should handle strategy changes when aggregator is not initialized', async () => {
      // Mock aggregator to be null initially
      require('../../services/weatherAggregator').default.mockImplementation(() => null);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        // Should not crash when aggregator is null
        result.current.setStrategy('consensus');
      });

      // Should complete without error
      expect(result.current.loading).toBe(false);
    });

    it('should return current strategy safely', async () => {
      const { result } = renderHook(() => useWeatherData('en', mockT));

      let strategy;
      await act(async () => {
        strategy = result.current.getStrategy();
      });

      expect(strategy).toBe('fallback');
    });

    it('should handle getStrategy when aggregator is null', async () => {
      // Mock aggregator to be null
      const nullAggregator = { current: null };
      jest.spyOn(require('react'), 'useRef').mockReturnValue(nullAggregator);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      let strategy;
      await act(async () => {
        strategy = result.current.getStrategy();
      });

      expect(strategy).toBe('fallback'); // Default fallback
    });

  });

  describe('Data Processing Edge Cases', () => {
    
    it('should handle forecast data with missing timestamps', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      const forecastWithMissingDt = [
        {
          // Missing dt field
          main: { temp: 15, temp_max: 18, temp_min: 12, humidity: 70 },
          weather: [{ main: 'Clouds', description: 'Cloudy', icon: '03d' }],
          wind: { speed: 8 }
        }
      ];

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);
      mockWeatherAggregator.getForecastData.mockResolvedValue(forecastWithMissingDt);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Should handle missing timestamps gracefully
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(validWeatherData);
    });

    it('should handle forecast data with invalid timestamps', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      const forecastWithInvalidDt = [
        {
          dt: 'invalid-timestamp',
          main: { temp: 15, temp_max: 18, temp_min: 12, humidity: 70 },
          weather: [{ main: 'Clouds', description: 'Cloudy', icon: '03d' }],
          wind: { speed: 8 }
        }
      ];

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);
      mockWeatherAggregator.getForecastData.mockResolvedValue(forecastWithInvalidDt);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Should handle invalid timestamps gracefully
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(validWeatherData);
    });

    it('should handle extreme weather values', async () => {
      const extremeWeatherData = {
        main: { 
          temp: -273.15, // Absolute zero
          humidity: 200, // Over 100%
          pressure: 0    // No pressure
        },
        weather: [{ main: 'Extreme', description: 'Impossible weather' }],
        wind: { speed: 999999 }, // Extreme wind speed
        name: 'ExtremeCity'
      };

      mockWeatherAggregator.getWeatherByCoords.mockResolvedValue(extremeWeatherData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCoords(0, 0);
      });

      // Should handle extreme values without crashing
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(extremeWeatherData);
    });

    it('should handle very large forecast arrays', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      // Generate a very large forecast array
      const largeForecastData = Array(1000).fill().map((_, index) => ({
        dt: Date.now() / 1000 + (index * 3600), // Each hour
        main: { temp: 15 + (index % 20), temp_max: 20, temp_min: 10, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear', icon: '01d' }],
        wind: { speed: 5 }
      }));

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);
      mockWeatherAggregator.getForecastData.mockResolvedValue(largeForecastData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Should handle large arrays efficiently
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(validWeatherData);
      expect(Array.isArray(result.current.forecastData)).toBe(true);
    });

  });

  describe('Memory and Performance', () => {
    
    it('should handle rapid successive calls', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      // Make multiple rapid calls
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          act(async () => {
            await result.current.fetchWeatherByCity(`City${i}`);
          })
        );
      }

      await Promise.allSettled(promises);

      // Should complete without issues
      expect(result.current.loading).toBe(false);
    });

    it('should handle concurrent coordinate and city requests', async () => {
      const weatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      mockWeatherAggregator.getWeatherByCoords.mockResolvedValue(weatherData);
      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(weatherData);

      const { result } = renderHook(() => useWeatherData('en', mockT));

      // Concurrent requests
      await act(async () => {
        await Promise.all([
          result.current.fetchWeatherByCoords(48.8566, 2.3522),
          result.current.fetchWeatherByCity('Paris'),
          result.current.fetchWeatherByCoords(51.5074, -0.1278),
          result.current.fetchWeatherByCity('London')
        ]);
      });

      expect(result.current.loading).toBe(false);
    });

  });

  describe('Language and Localization Edge Cases', () => {
    
    it('should handle unsupported language codes', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);

      const { result } = renderHook(() => useWeatherData('xyz', mockT)); // Invalid language

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      // Should work with any language code
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(validWeatherData);
    });

    it('should handle null or undefined language', async () => {
      const validWeatherData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'Clear sky' }],
        wind: { speed: 5 },
        name: 'Paris'
      };

      mockWeatherAggregator.getWeatherByCity.mockResolvedValue(validWeatherData);

      const { result } = renderHook(() => useWeatherData(null, mockT));

      await act(async () => {
        await result.current.fetchWeatherByCity('Paris');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(validWeatherData);
    });

  });

});