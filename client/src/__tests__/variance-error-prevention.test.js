/**
 * Tests spécifiques pour prévenir l'erreur "variance.toFixed is not a function"
 * Ce test reproduit le scénario exact qui a causé l'erreur en production
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataQualityCard from '../components/DataQualityCard';

// Mock du hook de traduction
jest.mock('../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key, params) => {
      const translations = {
        'dataQuality.title': 'Data Quality',
        'dataQuality.consensusMode': 'Consensus Mode',
        'dataQuality.variance': 'Temperature variance',
        'dataQuality.coherentData': 'Coherent data across sources',
        'dataQuality.incoherentData': 'Discrepancies detected'
      };
      
      let result = translations[key] || key;
      if (params) {
        Object.keys(params).forEach(param => {
          result = result.replace(`{{${param}}}`, params[param]);
        });
      }
      return result;
    }
  })
}));

describe('Variance Error Prevention Tests', () => {
  
  describe('Reproducing Production Error Scenarios', () => {
    
    it('should handle variance as non-object (the original error case)', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: 2.5, // This was the problem - variance as number instead of object
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      // This should NOT crash anymore
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      // Variance section should not be displayed when variance is not an object
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance as string', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: "2.5°C", // String instead of object
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance as array', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: [1.2, 2.5, 3.1], // Array instead of object
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance as boolean', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: true, // Boolean instead of object
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance object with non-numeric temperature', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: "not-a-number" // Non-numeric temperature
            },
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance object with null temperature', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: null // Null temperature
            },
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance object with undefined temperature', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: undefined // Undefined temperature
            },
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should correctly display variance when properly formatted', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: 2.456 // Valid numeric temperature
            },
            recommendedSource: 'primary'
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      // Should display the variance correctly
      expect(screen.getByText('Temperature variance')).toBeInTheDocument();
      expect(screen.getByText('2.46°C')).toBeInTheDocument();
    });

    it('should handle edge numeric values for temperature variance', () => {
      const edgeValues = [
        0,        // Zero
        -0,       // Negative zero
        0.0001,   // Very small positive
        -0.0001,  // Very small negative
        999.999,  // Large positive
        -999.999, // Large negative
        Infinity, // Infinity
        -Infinity,// Negative infinity
        NaN       // Not a Number
      ];

      edgeValues.forEach((value, index) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            sources: ['primary', 'backup'],
            multiSourceValidation: {
              isCoherent: true,
              variance: {
                temperature: value
              },
              recommendedSource: 'primary'
            },
            validation: {
              isValid: true,
              score: 0.9,
              warnings: [],
              errors: []
            }
          }
        };
        
        expect(() => {
          render(<DataQualityCard data={mockData} key={index} />);
        }).not.toThrow();
        
        // For non-finite numbers, variance should not be displayed
        if (!isFinite(value) || isNaN(value)) {
          expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
        }
      });
    });

  });

  describe('Type Safety Validation', () => {
    
    it('should validate all possible JavaScript types for variance', () => {
      const testTypes = [
        { name: 'number', value: 2.5 },
        { name: 'string', value: "2.5" },
        { name: 'boolean', value: true },
        { name: 'null', value: null },
        { name: 'undefined', value: undefined },
        { name: 'array', value: [1, 2, 3] },
        { name: 'function', value: () => {} },
        { name: 'date', value: new Date() },
        { name: 'regexp', value: /test/ },
        { name: 'symbol', value: Symbol('test') }
      ];

      testTypes.forEach(({ name, value }) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            sources: ['primary', 'backup'],
            multiSourceValidation: {
              isCoherent: true,
              variance: value,
              recommendedSource: 'primary'
            },
            validation: {
              isValid: true,
              score: 0.9,
              warnings: [],
              errors: []
            }
          }
        };
        
        expect(() => {
          render(<DataQualityCard data={mockData} key={name} />);
        }).not.toThrow(`Should not crash with variance type: ${name}`);
      });
    });

    it('should validate temperature property with all JavaScript types', () => {
      const testTypes = [
        { name: 'validNumber', value: 2.5, shouldDisplay: true },
        { name: 'zero', value: 0, shouldDisplay: true },
        { name: 'negativeNumber', value: -2.5, shouldDisplay: true },
        { name: 'string', value: "2.5", shouldDisplay: false },
        { name: 'boolean', value: true, shouldDisplay: false },
        { name: 'null', value: null, shouldDisplay: false },
        { name: 'undefined', value: undefined, shouldDisplay: false },
        { name: 'array', value: [2.5], shouldDisplay: false },
        { name: 'object', value: { temp: 2.5 }, shouldDisplay: false },
        { name: 'NaN', value: NaN, shouldDisplay: false },
        { name: 'Infinity', value: Infinity, shouldDisplay: false }
      ];

      testTypes.forEach(({ name, value, shouldDisplay }) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            sources: ['primary', 'backup'],
            multiSourceValidation: {
              isCoherent: true,
              variance: {
                temperature: value
              },
              recommendedSource: 'primary'
            },
            validation: {
              isValid: true,
              score: 0.9,
              warnings: [],
              errors: []
            }
          }
        };
        
        const { container } = render(<DataQualityCard data={mockData} key={name} />);
        
        expect(() => {
          // Re-render to ensure no errors
          render(<DataQualityCard data={mockData} key={`${name}-rerender`} />);
        }).not.toThrow(`Should not crash with temperature type: ${name}`);
        
        if (shouldDisplay) {
          expect(screen.getByText('Temperature variance')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
        }
        
        // Clean up for next iteration
        screen.getByText('Data Quality');
      });
    });

  });

  describe('Integration with Real WeatherOracle Output', () => {
    
    it('should handle actual WeatherOracle variance structure', () => {
      // This simulates the actual structure returned by WeatherOracle.compareMultipleSources
      const realOracleOutput = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup', 'legacy'],
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: 1.5,
              humidity: 5,
              windSpeed: 2.1
            },
            discrepancies: ['Temperature variance: 1.5°C'],
            recommendedSource: { name: 'primary' },
            confidence: 0.85
          },
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={realOracleOutput} />);
      }).not.toThrow();
      
      expect(screen.getByText('Temperature variance')).toBeInTheDocument();
      expect(screen.getByText('1.50°C')).toBeInTheDocument();
    });

  });

});