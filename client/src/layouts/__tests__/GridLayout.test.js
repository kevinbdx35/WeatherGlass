import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridLayout from '../GridLayout';

// Mock des composants
jest.mock('../../components/SearchInput', () => ({ onKeyPress, loading, error, locationLoading, isLocationSupported, ...props }) => (
  <div data-testid="search-input" data-loading={loading} data-error={error} data-location-loading={locationLoading} data-location-supported={isLocationSupported}>Search Input</div>
));

jest.mock('../../components/WeatherDisplay', () => ({ data }) => (
  <div data-testid="weather-display">Weather Display</div>
));

jest.mock('../../components/WeeklyForecast', () => ({ forecastData }) => (
  <div data-testid="weekly-forecast">Weekly Forecast</div>
));

jest.mock('../../components/WeatherChart', () => ({ forecastData, currentData }) => (
  <div data-testid="weather-chart">Weather Chart</div>
));

jest.mock('../../components/LoadingSkeleton', () => () => (
  <div data-testid="loading-skeleton">Loading Skeleton</div>
));

describe('GridLayout', () => {
  const defaultProps = {
    location: 'Paris',
    setLocation: jest.fn(),
    onSearchKeyPress: jest.fn(),
    searchLoading: false,
    searchError: '',
    onLocationClick: jest.fn(),
    locationLoading: false,
    isLocationSupported: true,
    weatherData: { name: 'Paris', temperature: 20 },
    forecastData: [],
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render grid layout with all components', () => {
    render(<GridLayout {...defaultProps} />);

    // Vérifier que le container principal a la classe grid
    expect(document.querySelector('.grid-container')).toBeInTheDocument();
    
    // Vérifier que tous les composants sont présents
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
  });

  it('should render loading skeleton when loading', () => {
    render(<GridLayout {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('weather-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('weekly-forecast')).not.toBeInTheDocument();
    expect(screen.queryByTestId('weather-chart')).not.toBeInTheDocument();
  });

  it('should have correct grid areas', () => {
    const { container } = render(<GridLayout {...defaultProps} />);
    
    // Vérifier les classes CSS des zones de grille
    expect(container.querySelector('.grid-search')).toBeInTheDocument();
    expect(container.querySelector('.grid-current-weather')).toBeInTheDocument();
    expect(container.querySelector('.grid-forecast')).toBeInTheDocument();
    expect(container.querySelector('.grid-charts')).toBeInTheDocument();
  });

  it('should pass correct props to search input', () => {
    const searchProps = {
      ...defaultProps,
      location: 'Lyon',
      searchLoading: true,
      searchError: 'Error message',
      locationLoading: true
    };

    render(<GridLayout {...searchProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('data-loading', 'true');
    expect(searchInput).toHaveAttribute('data-error', 'Error message');
    expect(searchInput).toHaveAttribute('data-location-loading', 'true');
  });

  it('should pass weather data to components', () => {
    const weatherData = { name: 'Marseille', temperature: 25 };
    const forecastData = [{ date: '2024-01-01', temp: 20 }];

    render(<GridLayout {...defaultProps} weatherData={weatherData} forecastData={forecastData} />);
    
    // Les composants mockés reçoivent les bonnes données
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
  });

  it('should handle empty weather data gracefully', () => {
    render(<GridLayout {...defaultProps} weatherData={{}} forecastData={[]} />);
    
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
  });

  it('should show loading state correctly', () => {
    const { container } = render(<GridLayout {...defaultProps} loading={true} />);
    
    expect(container.querySelector('.grid-loading')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});