import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock tous les composants visuels problématiques
jest.mock('../components/WeatherDisplay', () => {
  return function MockWeatherDisplay({ data }) {
    return <div data-testid="weather-display">{data?.name || 'No data'}</div>;
  };
});

jest.mock('../components/WeeklyForecast', () => {
  return function MockWeeklyForecast({ forecastData }) {
    return <div data-testid="weekly-forecast">{forecastData?.length || 0} days</div>;
  };
});

jest.mock('../components/WeatherChart', () => {
  return function MockWeatherChart() {
    return <div data-testid="weather-chart">Chart</div>;
  };
});

jest.mock('../components/BackgroundParticles', () => {
  return function MockBackgroundParticles() {
    return <div data-testid="background-particles">Particles</div>;
  };
});

jest.mock('../components/DynamicBackground', () => {
  return function MockDynamicBackground() {
    return <div data-testid="dynamic-background">Background</div>;
  };
});

jest.mock('../components/OfflineIndicator', () => {
  return function MockOfflineIndicator() {
    return <div data-testid="offline-indicator">Offline</div>;
  };
});

jest.mock('../components/InstallPrompt', () => {
  return function MockInstallPrompt() {
    return <div data-testid="install-prompt">Install</div>;
  };
});

jest.mock('../components/AutoThemeIndicator', () => {
  return function MockAutoThemeIndicator() {
    return <div data-testid="auto-theme-indicator">Theme</div>;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

// Mock les services météo pour éviter les appels réels
jest.mock('../services/openMeteoService', () => {
  return jest.fn().mockImplementation(() => ({
    getWeatherByCoords: jest.fn().mockResolvedValue({
      coord: { lat: 48.8566, lon: 2.3522 },
      main: { temp: 20, humidity: 60 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
      wind: { speed: 5, deg: 180 },
      name: 'Paris',
      raw_data: {
        daily: {
          time: ['2024-01-01', '2024-01-02'],
          weather_code: [0, 1],
          temperature_2m_max: [25, 23],
          temperature_2m_min: [15, 13],
          precipitation_sum: [0, 2],
          wind_speed_10m_max: [12, 14]
        }
      },
      aggregator: {
        usedSource: 'primary',
        strategy: 'fallback'
      }
    }),
    getWeatherByCity: jest.fn().mockResolvedValue({
      coord: { lat: 48.8566, lon: 2.3522 },
      main: { temp: 18, humidity: 65 },
      weather: [{ main: 'Clouds', description: 'few clouds' }],
      wind: { speed: 3, deg: 90 },
      name: 'Paris',
      raw_data: {
        daily: {
          time: ['2024-01-01'],
          weather_code: [1],
          temperature_2m_max: [22],
          temperature_2m_min: [14],
          precipitation_sum: [0],
          wind_speed_10m_max: [10]
        }
      },
      aggregator: {
        usedSource: 'primary',
        strategy: 'fallback'
      }
    }),
    getForecastData: jest.fn().mockReturnValue([
      {
        date: new Date('2024-01-01'),
        maxTemp: 25,
        minTemp: 15,
        description: 'clear sky',
        icon: '01d'
      },
      {
        date: new Date('2024-01-02'),
        maxTemp: 23,
        minTemp: 13,
        description: 'few clouds',
        icon: '02d'
      }
    ])
  }));
});

jest.mock('../services/weatherAPIService', () => {
  return jest.fn().mockImplementation(() => ({
    getWeatherByCoords: jest.fn(),
    getWeatherByCity: jest.fn(),
    getForecastByCoords: jest.fn(),
    getForecastByCity: jest.fn()
  }));
});

jest.mock('../services/meteoFranceService', () => {
  return jest.fn().mockImplementation(() => ({
    getWeatherAlerts: jest.fn().mockResolvedValue([])
  }));
});

describe('App Integration with Weather Aggregator', () => {
  beforeEach(() => {
    // Reset tous les mocks
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<App />);
    
    // Vérifier que les composants principaux sont présents
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
  });

  it('should display "No data" initially', () => {
    render(<App />);
    
    expect(screen.getByTestId('weather-display')).toHaveTextContent('No data');
    expect(screen.getByTestId('weekly-forecast')).toHaveTextContent('0 days');
  });

  it('should handle search input', async () => {
    render(<App />);
    
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
    
    // L'input doit être fonctionnel
    expect(searchInput).not.toBeDisabled();
  });

  it('should initialize weather aggregator without errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Attendre que l'initialisation soit terminée
    await waitFor(() => {
      expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    });
    
    // Vérifier qu'il n'y a pas d'erreurs dans la console
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should handle theme toggle', () => {
    render(<App />);
    
    const themeToggle = screen.getByRole('button', { name: /theme/i });
    expect(themeToggle).toBeInTheDocument();
  });

  it('should handle language toggle', () => {
    render(<App />);
    
    const languageToggle = screen.getByRole('button', { name: /language/i });
    expect(languageToggle).toBeInTheDocument();
  });

  it('should render layout components', () => {
    render(<App />);
    
    // Vérifier que la structure de layout est présente
    const appContainer = document.querySelector('.app');
    expect(appContainer).toBeInTheDocument();
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass('main-content');
  });
});