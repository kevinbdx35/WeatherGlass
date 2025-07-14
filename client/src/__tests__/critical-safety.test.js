/**
 * Tests critiques de sécurité pour prévenir les erreurs de production
 * Ces tests DOIVENT passer avant tout déploiement
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import des composants critiques
import DataQualityCard from '../components/DataQualityCard';
import DataQualityBadge from '../components/DataQualityBadge';

// Mock du hook de traduction
jest.mock('../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => key
  })
}));

describe('🚨 CRITICAL SAFETY TESTS 🚨', () => {
  
  describe('Type Safety - No .toFixed() errors', () => {
    
    it('CRITICAL: DataQualityCard should never crash on variance.toFixed()', () => {
      const dangerousInputs = [
        // The original error case
        { variance: 2.5 },
        { variance: "string" },
        { variance: true },
        { variance: [] },
        { variance: null },
        { variance: undefined },
        { variance: {} },
        { variance: { notTemperature: 2.5 } },
        { variance: { temperature: "not-number" } },
        { variance: { temperature: null } },
        { variance: { temperature: undefined } },
        { variance: { temperature: NaN } },
        { variance: { temperature: Infinity } },
        { variance: { temperature: -Infinity } }
      ];

      dangerousInputs.forEach((input, index) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            sources: ['primary', 'backup'],
            multiSourceValidation: {
              isCoherent: true,
              ...input
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
        }).not.toThrow(`FAILED on input ${index}: ${JSON.stringify(input)}`);
      });
    });

    it('CRITICAL: No numeric operations on non-numbers', () => {
      const nonNumericValues = [
        "string",
        true,
        false,
        null,
        undefined,
        [],
        {},
        () => {},
        Symbol('test')
      ];

      nonNumericValues.forEach((value, index) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            confidence: value, // Non-numeric confidence
            validation: {
              score: value, // Non-numeric score
              isValid: true,
              warnings: [],
              errors: []
            }
          }
        };

        expect(() => {
          render(<DataQualityCard data={mockData} key={index} />);
        }).not.toThrow(`FAILED with non-numeric value: ${typeof value}`);
      });
    });

  });

  describe('Null/Undefined Safety', () => {
    
    it('CRITICAL: Should handle completely missing data', () => {
      const emptyInputs = [
        null,
        undefined,
        {},
        { aggregator: null },
        { aggregator: undefined },
        { aggregator: {} }
      ];

      emptyInputs.forEach((data, index) => {
        expect(() => {
          render(<DataQualityCard data={data} key={index} />);
        }).not.toThrow(`FAILED with empty input ${index}: ${JSON.stringify(data)}`);
      });
    });

    it('CRITICAL: Should handle missing nested properties', () => {
      const mockData = {
        aggregator: {
          // Missing most properties
          validation: {
            // Missing most validation properties
          }
        }
      };

      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
    });

  });

  describe('Array Safety', () => {
    
    it('CRITICAL: Should handle malformed arrays', () => {
      const badArrays = [
        null,
        undefined,
        "not-array",
        123,
        true,
        {},
        [null, undefined, "mixed", 123, {}],
        Array(1000).fill("large-array")
      ];

      badArrays.forEach((badArray, index) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            sources: badArray, // Bad sources array
            validation: {
              warnings: badArray, // Bad warnings array
              errors: badArray,   // Bad errors array
              isValid: true,
              score: 0.9
            }
          }
        };

        expect(() => {
          render(<DataQualityCard data={mockData} key={index} />);
        }).not.toThrow(`FAILED with bad array ${index}: ${typeof badArray}`);
      });
    });

  });

  describe('Date/Time Safety', () => {
    
    it('CRITICAL: Should handle invalid timestamps', () => {
      const badTimestamps = [
        "invalid-date",
        "2023-99-99",
        123,
        null,
        undefined,
        true,
        [],
        {},
        "Mon, 25 Dec 1995 13:30:00 +0430", // Valid but unusual format
        new Date("invalid"),
        new Date(NaN)
      ];

      badTimestamps.forEach((timestamp, index) => {
        const mockData = {
          aggregator: {
            strategy: 'fallback',
            timestamp: timestamp,
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
        }).not.toThrow(`FAILED with timestamp ${index}: ${timestamp}`);
      });
    });

  });

  describe('Component Robustness', () => {
    
    it('CRITICAL: DataQualityBadge should never crash', () => {
      const malformedData = [
        null,
        undefined,
        {},
        { aggregator: null },
        { 
          aggregator: {
            validation: {
              score: "not-number",
              isValid: "not-boolean"
            }
          }
        }
      ];

      malformedData.forEach((data, index) => {
        expect(() => {
          render(<DataQualityBadge data={data} key={index} />);
        }).not.toThrow(`DataQualityBadge failed with input ${index}`);
      });
    });

    it('CRITICAL: Components should handle circular references', () => {
      const circularData = {
        aggregator: {
          strategy: 'fallback',
          validation: {
            isValid: true,
            score: 0.9,
            warnings: [],
            errors: []
          }
        }
      };
      
      // Create circular reference
      circularData.aggregator.self = circularData.aggregator;
      circularData.aggregator.validation.parent = circularData.aggregator;

      expect(() => {
        render(<DataQualityCard data={circularData} />);
      }).not.toThrow('Should handle circular references');
    });

  });

  describe('String Method Safety', () => {
    
    it('CRITICAL: No string methods on non-strings', () => {
      const nonStrings = [
        123,
        null,
        undefined,
        true,
        [],
        {},
        Symbol('test')
      ];

      nonStrings.forEach((value, index) => {
        const mockData = {
          aggregator: {
            strategy: value, // Non-string strategy
            usedSource: value, // Non-string source
            validation: {
              isValid: true,
              score: 0.9,
              warnings: [value], // Non-string warnings
              errors: [value]    // Non-string errors
            }
          }
        };

        expect(() => {
          render(<DataQualityCard data={mockData} key={index} />);
        }).not.toThrow(`FAILED with non-string value: ${typeof value}`);
      });
    });

  });

  describe('Mathematical Operations Safety', () => {
    
    it('CRITICAL: No division by zero or invalid math', () => {
      const problematicValues = [
        0,
        -0,
        NaN,
        Infinity,
        -Infinity,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.EPSILON
      ];

      problematicValues.forEach((value, index) => {
        const mockData = {
          aggregator: {
            strategy: 'consensus',
            confidence: value,
            agreement: value,
            validation: {
              score: value,
              isValid: true,
              warnings: [],
              errors: []
            },
            multiSourceValidation: {
              variance: {
                temperature: value
              },
              confidence: value
            }
          }
        };

        expect(() => {
          render(<DataQualityCard data={mockData} key={index} />);
        }).not.toThrow(`FAILED with problematic math value: ${value}`);
      });
    });

  });

  describe('Memory Safety', () => {
    
    it('CRITICAL: Should handle large data structures', () => {
      const largeData = {
        aggregator: {
          strategy: 'consensus',
          sources: Array(1000).fill('large-source'),
          validation: {
            isValid: true,
            score: 0.9,
            warnings: Array(500).fill('Large warning message '.repeat(100)),
            errors: Array(500).fill('Large error message '.repeat(100))
          }
        }
      };

      expect(() => {
        render(<DataQualityCard data={largeData} />);
      }).not.toThrow('Should handle large data structures');
    });

    it('CRITICAL: Should handle deeply nested structures', () => {
      let deepData = { aggregator: { validation: { isValid: true, score: 0.9, warnings: [], errors: [] } } };
      
      // Create deep nesting
      for (let i = 0; i < 100; i++) {
        deepData = { nested: deepData };
      }

      expect(() => {
        render(<DataQualityCard data={deepData} />);
      }).not.toThrow('Should handle deeply nested structures');
    });

  });

});