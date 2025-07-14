import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataQualityCard from '../DataQualityCard';

// Mock du hook useTranslation
jest.mock('../../hooks/useTranslation', () => () => ({
  t: (key, interpolations = {}) => {
    const translations = {
      'dataQuality.title': 'Qualité des Données',
      'dataQuality.oracleScore': 'Score Oracle',
      'dataQuality.confidence': 'Confiance',
      'dataQuality.strategy': 'Stratégie',
      'dataQuality.lastUpdate': 'Dernière mise à jour',
      'dataQuality.dataValid': 'Données validées',
      'dataQuality.dataInvalid': 'Données non fiables',
      'dataQuality.warnings': 'Avertissements',
      'dataQuality.errors': 'Erreurs',
      'dataQuality.justNow': 'À l\'instant',
      'dataQuality.oneMinuteAgo': 'Il y a 1 minute',
      'dataQuality.minutesAgo': `Il y a ${interpolations.minutes} minutes`,
      'dataQuality.oneHourAgo': 'Il y a 1 heure',
      'dataQuality.hoursAgo': `Il y a ${interpolations.hours} heures`,
      'dataQuality.moreThanOneDay': 'Il y a plus d\'un jour',
      'dataQuality.moreWarnings': 'autres avertissements',
      'dataQuality.moreErrors': 'autres erreurs',
      'dataQuality.strategies.fallback': 'Fallback intelligent',
      'dataQuality.strategies.consensus': 'Consensus multi-sources',
      'dataQuality.strategies.specialized': 'Source spécialisée'
    };
    return translations[key] || key;
  }
}));

describe('DataQualityCard', () => {
  const mockGoodData = {
    aggregator: {
      usedSource: 'primary',
      confidence: 0.9,
      strategy: 'fallback',
      timestamp: new Date().toISOString(),
      validation: {
        isValid: true,
        score: 0.95,
        warnings: [],
        errors: []
      }
    }
  };

  const mockBadData = {
    aggregator: {
      usedSource: 'legacy',
      confidence: 0.6,
      strategy: 'fallback',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      validation: {
        isValid: false,
        score: 0.5,
        warnings: ['Temperature seems high', 'Humidity data inconsistent'],
        errors: ['Missing wind data', 'Invalid pressure reading']
      }
    }
  };

  it('should not render when no aggregator data is provided', () => {
    const { container } = render(<DataQualityCard data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when no data is provided', () => {
    const { container } = render(<DataQualityCard />);
    expect(container.firstChild).toBeNull();
  });

  it('should render card with good quality data', () => {
    render(<DataQualityCard data={mockGoodData} />);
    
    expect(screen.getByText('Qualité des Données')).toBeInTheDocument();
    expect(screen.getByText('Open-Meteo')).toBeInTheDocument();
    expect(screen.getAllByText('95%')).toHaveLength(2); // Apparaît deux fois
    expect(screen.getAllByText('✅')).toHaveLength(2); // Header et validation
    expect(screen.getByText('Données validées')).toBeInTheDocument();
  });

  it('should render card with poor quality data', () => {
    render(<DataQualityCard data={mockBadData} />);
    
    expect(screen.getByText('Qualité des Données')).toBeInTheDocument();
    expect(screen.getByText('OpenWeatherMap')).toBeInTheDocument();
    expect(screen.getAllByText('50%')).toHaveLength(2); // Apparaît deux fois
    expect(screen.getAllByText('❌')).toHaveLength(3); // Header, validation et section erreurs
    expect(screen.getByText('Données non fiables')).toBeInTheDocument();
  });

  it('should display quality metrics with progress bars', () => {
    render(<DataQualityCard data={mockGoodData} />);
    
    expect(screen.getByText('Score Oracle')).toBeInTheDocument();
    expect(screen.getByText('Confiance')).toBeInTheDocument();
    expect(screen.getByText('Stratégie')).toBeInTheDocument();
    expect(screen.getByText('Dernière mise à jour')).toBeInTheDocument();
    
    // Vérifier la présence des barres de progression
    const progressBars = document.querySelectorAll('.score-bar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should display strategy translation', () => {
    render(<DataQualityCard data={mockGoodData} />);
    
    expect(screen.getByText('Fallback intelligent')).toBeInTheDocument();
  });

  it('should display warnings when present', () => {
    render(<DataQualityCard data={mockBadData} />);
    
    expect(screen.getByText(/Avertissements/)).toBeInTheDocument();
    expect(screen.getByText('Temperature seems high')).toBeInTheDocument();
    expect(screen.getByText('Humidity data inconsistent')).toBeInTheDocument();
  });

  it('should display errors when present', () => {
    render(<DataQualityCard data={mockBadData} />);
    
    expect(screen.getByText(/Erreurs/)).toBeInTheDocument();
    expect(screen.getByText('Missing wind data')).toBeInTheDocument();
    expect(screen.getByText('Invalid pressure reading')).toBeInTheDocument();
  });

  it('should handle unknown source gracefully', () => {
    const unknownSourceData = {
      aggregator: {
        usedSource: 'unknown-source',
        confidence: 0.7,
        validation: {
          isValid: true,
          score: 0.8,
          warnings: [],
          errors: []
        }
      }
    };
    
    render(<DataQualityCard data={unknownSourceData} />);
    
    expect(screen.getByText('❓')).toBeInTheDocument();
    expect(screen.getByText('Source inconnue')).toBeInTheDocument();
  });

  it('should display correct quality colors and icons', () => {
    // Test pour données excellentes
    const { rerender } = render(<DataQualityCard data={mockGoodData} />);
    expect(screen.getAllByText('✅')).toHaveLength(2); // Header et validation
    
    // Test pour données moyennes
    const averageData = {
      aggregator: {
        usedSource: 'primary',
        validation: { isValid: true, score: 0.8, warnings: [], errors: [] }
      }
    };
    
    rerender(<DataQualityCard data={averageData} />);
    expect(screen.getAllByText('⚠️')).toHaveLength(1); // Seulement dans header
    
    // Test pour données mauvaises
    rerender(<DataQualityCard data={mockBadData} />);
    expect(screen.getAllByText('❌')).toHaveLength(3); // Header, validation et section erreurs
  });

  it('should handle large number of warnings and errors', () => {
    const dataWithManyIssues = {
      aggregator: {
        usedSource: 'primary',
        validation: {
          isValid: false,
          score: 0.4,
          warnings: ['Warning 1', 'Warning 2', 'Warning 3', 'Warning 4', 'Warning 5'],
          errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4']
        }
      }
    };
    
    render(<DataQualityCard data={dataWithManyIssues} />);
    
    // Vérifier que seulement les 3 premiers sont affichés
    expect(screen.getByText('Warning 1')).toBeInTheDocument();
    expect(screen.getByText('Warning 2')).toBeInTheDocument();
    expect(screen.getByText('Warning 3')).toBeInTheDocument();
    expect(screen.getByText('+2 autres avertissements')).toBeInTheDocument();
    
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
    expect(screen.getByText('Error 3')).toBeInTheDocument();
    expect(screen.getByText('+1 autres erreurs')).toBeInTheDocument();
  });

  it('should format time ago correctly', () => {
    const recentData = {
      aggregator: {
        usedSource: 'primary',
        timestamp: new Date(Date.now() - 30 * 1000).toISOString(), // 30 seconds ago
        validation: { isValid: true, score: 0.9, warnings: [], errors: [] }
      }
    };
    
    render(<DataQualityCard data={recentData} />);
    expect(screen.getByText('À l\'instant')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DataQualityCard data={mockGoodData} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle missing validation data gracefully', () => {
    const incompleteData = {
      aggregator: {
        usedSource: 'primary',
        confidence: 0.8
        // validation manquante
      }
    };
    
    render(<DataQualityCard data={incompleteData} />);
    
    expect(screen.getByText('Qualité des Données')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(2); // Score par défaut apparaît deux fois
    expect(screen.getAllByText('❌')).toHaveLength(1); // Icône pour score 0 dans header seulement
  });
});