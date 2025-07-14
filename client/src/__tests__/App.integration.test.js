import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from '../App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock des hooks
jest.mock('../hooks/useGeolocation', () => ({
  __esModule: true,
  default: () => ({
    location: null,
    loading: false,
    error: null,
    getCurrentLocation: jest.fn(),
    isSupported: true
  })
}));

jest.mock('../hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    themeMode: 'auto',
    theme: 'light',
    toggleTheme: jest.fn()
  })
}));

jest.mock('../hooks/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => {
      const translations = {
        'search.placeholder': 'Rechercher une ville...',
        'search.errors.emptyInput': 'Veuillez saisir une ville',
        'search.errors.cityNotFound': 'Ville non trouvée',
        'search.errors.networkError': 'Erreur réseau',
        'search.errors.authError': 'Erreur d\'authentification',
        'common.error': 'Une erreur est survenue'
      };
      return translations[key] || key;
    },
    language: 'fr'
  })
}));

jest.mock('../hooks/useWeatherBackground', () => ({
  __esModule: true,
  default: () => ({
    currentBackground: null,
    updateBackground: jest.fn(),
    loading: false
  })
}));

jest.mock('../hooks/useAutoRefresh', () => ({
  __esModule: true,
  default: () => ({
    forceRefresh: jest.fn()
  })
}));

// Mock des composants lourds
jest.mock('../components/WeatherChart', () => {
  return function MockWeatherChart() {
    return <div data-testid="weather-chart">Weather Chart</div>;
  };
});

jest.mock('../components/BackgroundParticles', () => {
  return function MockBackgroundParticles() {
    return <div data-testid="background-particles">Background Particles</div>;
  };
});

jest.mock('../components/DynamicBackground', () => {
  return function MockDynamicBackground() {
    return <div data-testid="dynamic-background">Dynamic Background</div>;
  };
});

jest.mock('../components/LoadingSkeleton', () => {
  return function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading...</div>;
  };
});

describe('App Integration Tests', () => {
  const mockWeatherResponse = {
    data: {
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
      wind: { speed: 3.2, deg: 180 },
      visibility: 10000
    }
  };

  const mockForecastResponse = {
    data: {
      list: [
        {
          dt: 1640995200,
          main: { temp: 20, humidity: 70 },
          weather: [{ main: 'Rain', description: 'Pluie', icon: '10d' }],
          wind: { speed: 2.5 }
        },
        {
          dt: 1641081600,
          main: { temp: 18, humidity: 75 },
          weather: [{ main: 'Clouds', description: 'Nuageux', icon: '04d' }],
          wind: { speed: 3.0 }
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockClear();
  });

  describe('Weather Search Flow', () => {
    it('should search for weather when Enter is pressed', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherResponse)
        .mockResolvedValueOnce(mockForecastResponse);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });

      // Vérifier que les APIs ont été appelées avec les bonnes URLs
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('weather?q=Paris')
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('forecast?q=Paris')
      );

      // Vérifier que les données météo sont affichées
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });
    });

    it('should show error message for empty search', async () => {
      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Veuillez saisir une ville')).toBeInTheDocument();
      });

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 }
      });

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'NonExistentCity');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Ville non trouvée')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        code: 'NETWORK_ERROR'
      });

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Erreur d\'authentification')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton during API call', async () => {
      // Créer une promesse qui ne se résout pas immédiatement
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockedAxios.get.mockReturnValue(pendingPromise);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      // Vérifier que le loading skeleton est affiché
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

      // Résoudre la promesse
      resolvePromise(mockWeatherResponse);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('UI Components Rendering', () => {
    it('should render all main components', () => {
      render(<App />);

      expect(screen.getByTestId('dynamic-background')).toBeInTheDocument();
      expect(screen.getByTestId('background-particles')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher une ville...')).toBeInTheDocument();
    });

    it('should render weather components after successful search', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherResponse)
        .mockResolvedValueOnce(mockForecastResponse);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Data Processing', () => {
    it('should process forecast data correctly', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherResponse)
        .mockResolvedValueOnce(mockForecastResponse);

      render(<App />);

      const searchInput = screen.getByPlaceholderText('Rechercher une ville...');
      
      await userEvent.type(searchInput, 'Paris');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });

      // Le composant devrait traiter les données de prévision
      // et afficher les composants appropriés
      await waitFor(() => {
        expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
      });
    });
  });
});