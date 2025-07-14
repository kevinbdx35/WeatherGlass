import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherDisplay from '../WeatherDisplay';

// Mock du hook useTranslation
jest.mock('../../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => {
      const translations = {
        'weather.metrics.windDirection.N': 'Nord',
        'weather.metrics.windDirection.NE': 'Nord-Est',
        'weather.metrics.windDirection.E': 'Est',
        'weather.metrics.windDirection.SE': 'Sud-Est',
        'weather.metrics.windDirection.S': 'Sud',
        'weather.metrics.windDirection.SW': 'Sud-Ouest',
        'weather.metrics.windDirection.W': 'Ouest',
        'weather.metrics.windDirection.NW': 'Nord-Ouest',
        'weather.metrics.feelsLike': 'Ressenti',
        'weather.metrics.humidity': 'Humidité',
        'weather.metrics.windSpeed': 'Vent',
        'weather.metrics.pressure': 'Pression',
        'weather.metrics.visibility': 'Visibilité',
        'weather.metrics.uvIndex': 'Index UV'
      };
      return translations[key] || key;
    }
  })
}));

// Mock du composant WeatherIcon
jest.mock('../WeatherIcon', () => {
  return function MockWeatherIcon({ condition, size, animated }) {
    return <div data-testid="weather-icon" data-condition={condition} data-size={size} data-animated={animated} />;
  };
});

describe('WeatherDisplay', () => {
  const mockWeatherData = {
    name: 'Paris',
    sys: { country: 'FR' },
    main: {
      temp: 22.5,
      feels_like: 24.1,
      humidity: 65,
      pressure: 1013
    },
    weather: [{
      main: 'Clear',
      description: 'Ciel dégagé',
      icon: '01d'
    }],
    wind: {
      speed: 3.2,
      deg: 180
    },
    visibility: 10000
  };

  it('should render nothing when no data is provided', () => {
    const { container } = render(<WeatherDisplay data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display city name and country', () => {
    render(<WeatherDisplay data={mockWeatherData} />);
    
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
  });

  it('should display temperature correctly', () => {
    render(<WeatherDisplay data={mockWeatherData} />);
    
    expect(screen.getByText('23')).toBeInTheDocument(); // Température arrondie
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('should render weather icon with correct props', () => {
    render(<WeatherDisplay data={mockWeatherData} />);
    
    const weatherIcon = screen.getByTestId('weather-icon');
    expect(weatherIcon).toHaveAttribute('data-condition', 'Clear');
    expect(weatherIcon).toHaveAttribute('data-size', '80');
    expect(weatherIcon).toHaveAttribute('data-animated', 'true');
  });

  it('should handle missing optional data gracefully', () => {
    const minimalData = {
      name: 'London',
      main: { temp: 18.0 },
      weather: [{ main: 'Rain', description: 'Pluie', icon: '10d' }]
    };

    render(<WeatherDisplay data={minimalData} />);
    
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('should format wind direction correctly', () => {
    render(<WeatherDisplay data={mockWeatherData} />);
    
    // Wind deg: 180 = Sud
    expect(screen.getByText('Sud')).toBeInTheDocument();
  });

  it('should display weather metrics when available', () => {
    render(<WeatherDisplay data={mockWeatherData} />);
    
    expect(screen.getByText('Humidité')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('Vent')).toBeInTheDocument();
    expect(screen.getByText('3.2 m/s')).toBeInTheDocument();
  });
});