import WeatherOracle from '../weatherOracle';

describe('WeatherOracle', () => {
  let oracle;

  beforeEach(() => {
    oracle = new WeatherOracle();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(oracle.thresholds.temperature.min).toBe(-100);
      expect(oracle.thresholds.temperature.max).toBe(60);
      expect(oracle.validationStats.totalValidations).toBe(0);
    });
  });

  describe('validateStructure', () => {
    it('should pass validation for complete data structure', () => {
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        name: 'Paris'
      };

      const result = oracle.validateStructure(validData);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1.0);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        main: { temp: 20 }
        // Missing weather and name
      };

      const result = oracle.validateStructure(invalidData);
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(0.5);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect missing main fields', () => {
      const invalidData = {
        main: { temp: 20 }, // Missing humidity
        weather: [{ main: 'Clear' }],
        name: 'Paris'
      };

      const result = oracle.validateStructure(invalidData);
      expect(result.issues.some(issue => issue.includes('humidity'))).toBe(true);
    });
  });

  describe('validateTemperature', () => {
    it('should pass validation for realistic temperatures', () => {
      const validData = {
        main: { 
          temp: 20, 
          feels_like: 22, 
          temp_min: 15, 
          temp_max: 25 
        }
      };

      const result = oracle.validateTemperature(validData);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1.0);
    });

    it('should fail validation for impossible temperatures', () => {
      const invalidData = {
        main: { temp: 150 } // Impossible temperature
      };

      const result = oracle.validateTemperature(invalidData);
      expect(result.passed).toBe(false);
      expect(result.issues.some(issue => issue.includes('outside physical range'))).toBe(true);
    });

    it('should detect min > max temperature inconsistency', () => {
      const invalidData = {
        main: { temp_min: 25, temp_max: 15 } // min > max
      };

      const result = oracle.validateTemperature(invalidData);
      expect(result.passed).toBe(false);
      expect(result.issues.some(issue => issue.includes('min temp') && issue.includes('max temp'))).toBe(true);
    });

    it('should warn about excessive temperature variation', () => {
      const invalidData = {
        main: { temp_min: -10, temp_max: 35 } // 45°C variation
      };

      const result = oracle.validateTemperature(invalidData);
      expect(result.issues.some(issue => issue.includes('Excessive temperature variation'))).toBe(true);
    });

    it('should warn about unrealistic feels_like difference', () => {
      const invalidData = {
        main: { temp: 20, feels_like: 45 } // 25°C difference
      };

      const result = oracle.validateTemperature(invalidData);
      expect(result.issues.some(issue => issue.includes('feels_like difference'))).toBe(true);
    });
  });

  describe('validateHumidity', () => {
    it('should pass validation for valid humidity', () => {
      const validData = { main: { humidity: 65 } };
      const result = oracle.validateHumidity(validData);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1.0);
    });

    it('should fail validation for impossible humidity', () => {
      const invalidData = { main: { humidity: 150 } };
      const result = oracle.validateHumidity(invalidData);
      expect(result.passed).toBe(false);
      expect(result.issues.some(issue => issue.includes('outside valid range'))).toBe(true);
    });
  });

  describe('validatePressure', () => {
    it('should pass validation for realistic pressure', () => {
      const validData = { main: { pressure: 1013 } };
      const result = oracle.validatePressure(validData);
      expect(result.passed).toBe(true);
    });

    it('should fail validation for unrealistic pressure', () => {
      const invalidData = { main: { pressure: 500 } };
      const result = oracle.validatePressure(invalidData);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateWind', () => {
    it('should pass validation for realistic wind', () => {
      const validData = { wind: { speed: 10, deg: 180 } };
      const result = oracle.validateWind(validData);
      expect(result.passed).toBe(true);
    });

    it('should fail validation for impossible wind speed', () => {
      const invalidData = { wind: { speed: 200 } };
      const result = oracle.validateWind(invalidData);
      expect(result.passed).toBe(false);
    });

    it('should fail validation for invalid wind direction', () => {
      const invalidData = { wind: { deg: 400 } };
      const result = oracle.validateWind(invalidData);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateCoherence', () => {
    it('should detect snow at warm temperature', () => {
      const invalidData = {
        weather: [{ main: 'Snow' }],
        main: { temp: 15 }
      };

      const result = oracle.validateCoherence(invalidData);
      expect(result.issues.some(issue => issue.includes('Snow reported at') && issue.includes('too warm'))).toBe(true);
    });

    it('should detect rain with low humidity', () => {
      const invalidData = {
        weather: [{ main: 'Rain' }],
        main: { humidity: 20 }
      };

      const result = oracle.validateCoherence(invalidData);
      expect(result.issues.some(issue => issue.includes('Rain reported with low humidity'))).toBe(true);
    });
  });

  describe('validateTemporal', () => {
    it('should warn about old data', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 10800; // 3 hours ago
      const oldData = { dt: oldTimestamp };

      const result = oracle.validateTemporal(oldData);
      expect(result.issues.some(issue => issue.includes('old'))).toBe(true);
    });

    it('should pass validation for recent data', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
      const recentData = { dt: recentTimestamp };

      const result = oracle.validateTemporal(recentData);
      expect(result.passed).toBe(true);
    });
  });

  describe('validateWeatherData', () => {
    it('should provide comprehensive validation', () => {
      const validData = {
        main: { temp: 20, humidity: 60, pressure: 1013 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 5, deg: 180 },
        name: 'Paris',
        dt: Math.floor(Date.now() / 1000) - 300
      };

      const result = oracle.validateWeatherData(validData, 'test-source');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0.9);
      expect(result.source).toBe('test-source');
      expect(result.checks).toBeDefined();
    });

    it('should mark invalid data with low score', () => {
      const invalidData = {
        main: { temp: 200, humidity: 150 }, // Impossible values
        weather: [{ main: 'Snow' }], // Inconsistent with temperature
        name: 'Test'
      };

      const result = oracle.validateWeatherData(invalidData, 'test-source');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(0.7);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should update validation statistics', () => {
      const initialStats = oracle.getStats();
      const validData = {
        main: { temp: 20, humidity: 60 },
        weather: [{ main: 'Clear' }],
        name: 'Paris'
      };

      oracle.validateWeatherData(validData);
      const newStats = oracle.getStats();
      
      expect(newStats.totalValidations).toBe(initialStats.totalValidations + 1);
    });
  });

  describe('compareMultipleSources', () => {
    it('should detect coherent sources', () => {
      const sources = [
        { name: 'source1', data: { main: { temp: 20 }, weather: [{ main: 'Clear' }] } },
        { name: 'source2', data: { main: { temp: 21 }, weather: [{ main: 'Clear' }] } }
      ];

      const result = oracle.compareMultipleSources(sources);
      expect(result.isCoherent).toBe(true);
      expect(result.variance.temperature).toBe(1);
    });

    it('should detect incoherent temperature sources', () => {
      const sources = [
        { name: 'source1', data: { main: { temp: 20 } } },
        { name: 'source2', data: { main: { temp: 35 } } } // 15°C difference
      ];

      const result = oracle.compareMultipleSources(sources);
      expect(result.isCoherent).toBe(false);
      expect(result.discrepancies.length).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should detect different weather conditions', () => {
      const sources = [
        { name: 'source1', data: { weather: [{ main: 'Clear' }] } },
        { name: 'source2', data: { weather: [{ main: 'Rain' }] } }
      ];

      const result = oracle.compareMultipleSources(sources);
      expect(result.discrepancies.some(d => d.includes('Different weather conditions'))).toBe(true);
    });

    it('should recommend best source', () => {
      const sources = [
        { 
          name: 'bad-source', 
          data: { main: { temp: 200, humidity: 150 } } // Invalid data
        },
        { 
          name: 'good-source', 
          data: { main: { temp: 20, humidity: 60 }, weather: [{ main: 'Clear' }], name: 'Paris' }
        }
      ];

      const result = oracle.compareMultipleSources(sources);
      expect(result.recommendedSource.name).toBe('good-source');
    });
  });

  describe('getStats', () => {
    it('should return comprehensive statistics', () => {
      const stats = oracle.getStats();
      expect(stats).toHaveProperty('totalValidations');
      expect(stats).toHaveProperty('passed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('warnings');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('thresholds');
    });

    it('should calculate success rate correctly', () => {
      // Add some validations
      oracle.validateWeatherData({ main: { temp: 20 }, weather: [{}], name: 'Test' });
      oracle.validateWeatherData({ main: { temp: 200 } }); // This should fail
      
      const stats = oracle.getStats();
      expect(parseFloat(stats.successRate)).toBeGreaterThan(0);
    });
  });

  describe('resetStatsIfNeeded', () => {
    it('should reset stats on new day', () => {
      oracle.validationStats.totalValidations = 100;
      oracle.validationStats.lastReset = '2023-01-01';

      oracle.resetStatsIfNeeded();

      expect(oracle.validationStats.totalValidations).toBe(0);
      expect(oracle.validationStats.lastReset).toBe(new Date().toDateString());
    });

    it('should not reset stats on same day', () => {
      oracle.validationStats.totalValidations = 100;
      oracle.validationStats.lastReset = new Date().toDateString();

      oracle.resetStatsIfNeeded();

      expect(oracle.validationStats.totalValidations).toBe(100);
    });
  });
});