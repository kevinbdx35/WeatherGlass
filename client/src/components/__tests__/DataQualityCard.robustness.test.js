import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataQualityCard from '../DataQualityCard';

// Mock du hook de traduction
jest.mock('../../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key, params) => {
      const translations = {
        'dataQuality.title': 'Data Quality',
        'dataQuality.oracleScore': 'Oracle Score',
        'dataQuality.confidence': 'Confidence',
        'dataQuality.strategy': 'Strategy',
        'dataQuality.lastUpdate': 'Last update',
        'dataQuality.dataValid': 'Data validated',
        'dataQuality.dataInvalid': 'Data unreliable',
        'dataQuality.justNow': 'Just now',
        'dataQuality.strategies.fallback': 'Smart fallback',
        'dataQuality.strategies.consensus': 'Multi-source consensus',
        'dataQuality.strategies.specialized': 'Specialized source',
        'dataQuality.consensusMode': 'Consensus Mode',
        'dataQuality.consensusFrom': 'Consensus from',
        'dataQuality.sources': 'sources',
        'dataQuality.agreement': 'Agreement',
        'dataQuality.coherentData': 'Coherent data across sources',
        'dataQuality.incoherentData': 'Discrepancies detected',
        'dataQuality.variance': 'Temperature variance',
        'dataQuality.recommendedSource': 'Recommended source',
        'dataQuality.specializedMode': 'Specialized Mode',
        'dataQuality.geographicalContext': 'Geographical context',
        'dataQuality.selectionReason': 'Source selection reason'
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

describe('DataQualityCard Robustness Tests', () => {
  
  describe('Edge Cases and Error Prevention', () => {
    
    it('should handle undefined aggregator data gracefully', () => {
      const mockData = {
        // No aggregator property
      };
      
      const { container } = render(<DataQualityCard data={mockData} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle null aggregator data gracefully', () => {
      const mockData = {
        aggregator: null
      };
      
      const { container } = render(<DataQualityCard data={mockData} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing validation data gracefully', () => {
      const mockData = {
        aggregator: {
          strategy: 'fallback',
          usedSource: 'primary',
          timestamp: new Date().toISOString()
          // No validation property
        }
      };
      
      render(<DataQualityCard data={mockData} />);
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
    });

    it('should handle variance as non-number in consensus mode', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          agreement: 0.85,
          timestamp: new Date().toISOString(),
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: "not-a-number" // This should not crash
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
      
      // This should not throw an error
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
      expect(screen.getByText('Consensus Mode')).toBeInTheDocument();
    });

    it('should handle variance as undefined in consensus mode', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          agreement: 0.85,
          timestamp: new Date().toISOString(),
          multiSourceValidation: {
            isCoherent: true,
            variance: undefined, // Undefined variance
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
      
      expect(screen.getByText('Consensus Mode')).toBeInTheDocument();
      // Variance section should not be rendered
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should handle variance object without temperature property', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          agreement: 0.85,
          timestamp: new Date().toISOString(),
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              // No temperature property
              humidity: 5.2
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
      
      expect(screen.getByText('Consensus Mode')).toBeInTheDocument();
      // Variance section should not be rendered
      expect(screen.queryByText('Temperature variance')).not.toBeInTheDocument();
    });

    it('should properly display variance when it is a valid number', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup'],
          agreement: 0.85,
          timestamp: new Date().toISOString(),
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: 2.5 // Valid number
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
      
      render(<DataQualityCard data={mockData} />);
      
      expect(screen.getByText('Temperature variance')).toBeInTheDocument();
      expect(screen.getByText('2.50°C')).toBeInTheDocument();
    });

    it('should handle missing sources array in consensus mode', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          // No sources array
          agreement: 0.85,
          timestamp: new Date().toISOString(),
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
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
    });

    it('should handle specialized mode with missing context', () => {
      const mockData = {
        aggregator: {
          strategy: 'specialized',
          usedSource: 'primary',
          // No context or selectedReason
          timestamp: new Date().toISOString(),
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
      
      expect(screen.getByText('Specialized Mode')).toBeInTheDocument();
    });

    it('should handle invalid timestamp gracefully', () => {
      const mockData = {
        aggregator: {
          strategy: 'fallback',
          usedSource: 'primary',
          timestamp: 'invalid-date', // Invalid timestamp
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
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
    });

    it('should handle missing timestamp gracefully', () => {
      const mockData = {
        aggregator: {
          strategy: 'fallback',
          usedSource: 'primary',
          // No timestamp
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
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
    });

    it('should handle very large arrays of warnings and errors', () => {
      const mockData = {
        aggregator: {
          strategy: 'fallback',
          usedSource: 'primary',
          timestamp: new Date().toISOString(),
          validation: {
            isValid: false,
            score: 0.6,
            warnings: Array(10).fill('Sample warning'),
            errors: Array(10).fill('Sample error')
          }
        }
      };
      
      expect(() => {
        render(<DataQualityCard data={mockData} />);
      }).not.toThrow();
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
      // Should show max 3 + "more" indicator
      expect(screen.getByText('+7 more warnings')).toBeInTheDocument();
      expect(screen.getByText('+7 more errors')).toBeInTheDocument();
    });

  });

  describe('All Strategy Modes', () => {
    
    it('should render fallback mode correctly', () => {
      const mockData = {
        aggregator: {
          strategy: 'fallback',
          usedSource: 'primary',
          timestamp: new Date().toISOString(),
          confidence: 0.9,
          validation: {
            isValid: true,
            score: 0.95,
            warnings: [],
            errors: []
          }
        }
      };
      
      render(<DataQualityCard data={mockData} />);
      
      expect(screen.getByText('Data Quality')).toBeInTheDocument();
      expect(screen.getByText('Open-Meteo')).toBeInTheDocument();
      expect(screen.getByText('Smart fallback')).toBeInTheDocument();
    });

    it('should render consensus mode correctly', () => {
      const mockData = {
        aggregator: {
          strategy: 'consensus',
          sources: ['primary', 'backup', 'legacy'],
          agreement: 0.92,
          timestamp: new Date().toISOString(),
          confidence: 0.88,
          multiSourceValidation: {
            isCoherent: true,
            variance: {
              temperature: 1.2
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
      
      render(<DataQualityCard data={mockData} />);
      
      expect(screen.getByText('Consensus Mode')).toBeInTheDocument();
      expect(screen.getByText('Consensus from 3 sources')).toBeInTheDocument();
      expect(screen.getByText('Agreement: 92%')).toBeInTheDocument();
      expect(screen.getByText('1.20°C')).toBeInTheDocument();
    });

    it('should render specialized mode correctly', () => {
      const mockData = {
        aggregator: {
          strategy: 'specialized',
          usedSource: 'alerts',
          selectedReason: 'Official French meteorological service for French territory',
          context: 'France',
          timestamp: new Date().toISOString(),
          confidence: 0.95,
          validation: {
            isValid: true,
            score: 0.98,
            warnings: [],
            errors: []
          }
        }
      };
      
      render(<DataQualityCard data={mockData} />);
      
      expect(screen.getByText('Specialized Mode')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Official French meteorological service for French territory')).toBeInTheDocument();
    });

  });

});