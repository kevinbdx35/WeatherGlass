import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataQualityBadge from '../DataQualityBadge';

// Mock du hook useTranslation
jest.mock('../../hooks/useTranslation', () => () => ({
  t: (key, interpolations = {}) => {
    const translations = {
      'dataQuality.ariaLabel': `Data quality: ${interpolations.source}, score ${interpolations.score}%`,
      'dataQuality.scoreTitle': `Quality score: ${interpolations.score}%`,
      'dataQuality.title': 'Data Quality',
      'dataQuality.source': 'Source',
      'dataQuality.oracleScore': 'Oracle Score',
      'dataQuality.confidence': 'Confidence',
      'dataQuality.strategy': 'Strategy',
      'dataQuality.lastUpdate': 'Last update',
      'dataQuality.dataValid': 'Data validated',
      'dataQuality.dataInvalid': 'Data unreliable',
      'dataQuality.confidenceDescription': 'Source reliability',
      'dataQuality.strategies.fallback': 'Smart fallback',
      'dataQuality.strategies.consensus': 'Multi-source consensus',
      'dataQuality.justNow': 'Just now',
      'dataQuality.warnings': 'Warnings',
      'dataQuality.errors': 'Errors'
    };
    return translations[key] || key;
  }
}));

describe('DataQualityBadge', () => {
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
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      validation: {
        isValid: false,
        score: 0.5,
        warnings: ['Temperature seems high', 'Humidity data inconsistent'],
        errors: ['Missing wind data', 'Invalid pressure reading']
      }
    }
  };

  it('should not render when no aggregator data is provided', () => {
    const { container } = render(<DataQualityBadge data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when no data is provided', () => {
    const { container } = render(<DataQualityBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('should render badge for good quality data', () => {
    render(<DataQualityBadge data={mockGoodData} compact={true} />);
    
    // Vérifier la présence du badge
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Data quality: Open-Meteo, score 95%');
    
    // Vérifier les icônes
    expect(screen.getByText('🌐')).toBeInTheDocument(); // Icône Open-Meteo
    expect(screen.getByText('✅')).toBeInTheDocument(); // Icône de qualité verte
  });

  it('should render badge for poor quality data', () => {
    render(<DataQualityBadge data={mockBadData} compact={true} />);
    
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Data quality: OpenWeatherMap, score 50%');
    
    // Vérifier les icônes
    expect(screen.getByText('☁️')).toBeInTheDocument(); // Icône OpenWeatherMap
    expect(screen.getByText('❌')).toBeInTheDocument(); // Icône de qualité rouge
  });

  it('should show score text in non-compact mode', () => {
    render(<DataQualityBadge data={mockGoodData} compact={false} />);
    
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should not show score text in compact mode', () => {
    render(<DataQualityBadge data={mockGoodData} compact={true} />);
    
    expect(screen.queryByText('95%')).not.toBeInTheDocument();
  });

  it('should show tooltip on hover', () => {
    render(<DataQualityBadge data={mockGoodData} />);
    
    const badge = screen.getByRole('button');
    
    // Vérifier que le tooltip n'est pas visible initialement
    expect(screen.queryByText('Data Quality')).not.toBeInTheDocument();
    
    // Simuler le survol
    fireEvent.mouseEnter(badge);
    
    // Vérifier que le tooltip est maintenant visible
    expect(screen.getByText('Data Quality')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Oracle Score')).toBeInTheDocument();
    expect(screen.getByText('🌐 Open-Meteo')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(<DataQualityBadge data={mockGoodData} />);
    
    const badge = screen.getByRole('button');
    
    // Afficher le tooltip
    fireEvent.mouseEnter(badge);
    expect(screen.getByText('Data Quality')).toBeInTheDocument();
    
    // Cacher le tooltip
    fireEvent.mouseLeave(badge);
    expect(screen.queryByText('Data Quality')).not.toBeInTheDocument();
  });

  it('should display warnings and errors in tooltip', () => {
    render(<DataQualityBadge data={mockBadData} />);
    
    const badge = screen.getByRole('button');
    fireEvent.mouseEnter(badge);
    
    // Vérifier les avertissements (rechercher le texte avec l'emoji)
    expect(screen.getByText(/⚠️\s+Warnings/)).toBeInTheDocument();
    expect(screen.getByText('Temperature seems high')).toBeInTheDocument();
    expect(screen.getByText('Humidity data inconsistent')).toBeInTheDocument();
    
    // Vérifier les erreurs (rechercher le texte avec l'emoji)
    expect(screen.getByText(/❌\s+Errors/)).toBeInTheDocument();
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
    
    render(<DataQualityBadge data={unknownSourceData} />);
    
    const badge = screen.getByRole('button');
    fireEvent.mouseEnter(badge);
    
    // Vérifier que le badge fonctionne avec une source inconnue
    expect(screen.getByText('❓ Source inconnue')).toBeInTheDocument();
  });

  it('should display correct quality colors', () => {
    // Test pour données excellentes (score > 90%)
    const excellentData = {
      aggregator: {
        usedSource: 'primary',
        validation: { isValid: true, score: 0.95, warnings: [], errors: [] }
      }
    };
    
    const { rerender } = render(<DataQualityBadge data={excellentData} />);
    expect(screen.getByText('✅')).toBeInTheDocument();
    
    // Test pour données moyennes (score 70-90%)
    const averageData = {
      aggregator: {
        usedSource: 'primary',
        validation: { isValid: true, score: 0.8, warnings: [], errors: [] }
      }
    };
    
    rerender(<DataQualityBadge data={averageData} />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    
    // Test pour données mauvaises (score < 70%)
    const poorData = {
      aggregator: {
        usedSource: 'primary',
        validation: { isValid: false, score: 0.5, warnings: [], errors: [] }
      }
    };
    
    rerender(<DataQualityBadge data={poorData} />);
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should handle missing validation data gracefully', () => {
    const incompleteData = {
      aggregator: {
        usedSource: 'primary',
        confidence: 0.8
        // validation manquante
      }
    };
    
    render(<DataQualityBadge data={incompleteData} />);
    
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
    // Avec validation manquante, score par défaut = 0, donc icône rouge
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should be accessible via keyboard', () => {
    render(<DataQualityBadge data={mockGoodData} />);
    
    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('tabIndex', '0');
    
    // Vérifier que le badge peut recevoir le focus
    badge.focus();
    expect(badge).toHaveFocus();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DataQualityBadge 
        data={mockGoodData} 
        className="custom-class" 
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should show correct strategy translation', () => {
    render(<DataQualityBadge data={mockGoodData} />);
    
    const badge = screen.getByRole('button');
    fireEvent.mouseEnter(badge);
    
    expect(screen.getByText('Smart fallback')).toBeInTheDocument();
  });
});

describe('DataQualityBadge - Source Information', () => {
  it('should display correct source information for each source type', () => {
    const sourceTests = [
      {
        source: 'primary',
        expectedIcon: '🌐',
        expectedName: 'Open-Meteo'
      },
      {
        source: 'backup',
        expectedIcon: '🔄',
        expectedName: 'WeatherAPI'
      },
      {
        source: 'alerts',
        expectedIcon: '🇫🇷',
        expectedName: 'Météo-France'
      },
      {
        source: 'legacy',
        expectedIcon: '☁️',
        expectedName: 'OpenWeatherMap'
      }
    ];
    
    sourceTests.forEach(({ source, expectedIcon, expectedName }) => {
      const testData = {
        aggregator: {
          usedSource: source,
          validation: { isValid: true, score: 0.9, warnings: [], errors: [] }
        }
      };
      
      const { rerender } = render(<DataQualityBadge data={testData} />);
      
      expect(screen.getByText(expectedIcon)).toBeInTheDocument();
      
      const badge = screen.getByRole('button');
      fireEvent.mouseEnter(badge);
      
      expect(screen.getByText(`${expectedIcon} ${expectedName}`)).toBeInTheDocument();
      
      fireEvent.mouseLeave(badge);
      
      if (source !== sourceTests[sourceTests.length - 1].source) {
        rerender(<div />); // Clear pour le prochain test
      }
    });
  });
});