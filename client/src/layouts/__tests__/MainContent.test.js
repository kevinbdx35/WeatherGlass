import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainContent from '../MainContent';

// Mock des composants
jest.mock('../../components/SearchInput', () => {
  return function MockSearchInput(props) {
    return (
      <div 
        data-testid="search-input"
        data-location={props.location}
        data-loading={props.loading}
        data-error={props.error}
      >
        Search Input
      </div>
    );
  };
});

jest.mock('../../components/WeatherDisplay', () => {
  return function MockWeatherDisplay({ data }) {
    return (
      <div data-testid="weather-display" data-city={data?.name || ''}>
        Weather Display
      </div>
    );
  };
});

jest.mock('../../components/WeeklyForecast', () => {
  return function MockWeeklyForecast({ forecastData }) {
    return (
      <div data-testid="weekly-forecast" data-forecast-length={forecastData?.length}>
        Weekly Forecast
      </div>
    );
  };
});

jest.mock('../../components/WeatherChart', () => {
  return function MockWeatherChart({ forecastData, currentData }) {
    return (
      <div 
        data-testid="weather-chart"
        data-forecast-length={forecastData?.length}
        data-current-city={currentData?.name}
      >
        Weather Chart
      </div>
    );
  };
});

jest.mock('../../components/LoadingSkeleton', () => {
  return function MockLoadingSkeleton() {
    return <div data-testid="loading-skeleton">Loading...</div>;
  };
});

describe('MainContent', () => {
  const defaultProps = {
    location: '',
    setLocation: jest.fn(),
    onSearchKeyPress: jest.fn(),
    searchLoading: false,
    searchError: '',
    onLocationClick: jest.fn(),
    locationLoading: false,
    isLocationSupported: true,
    weatherData: {},
    forecastData: [],
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render SearchInput with correct props', () => {
    const props = {
      ...defaultProps,
      location: 'Paris',
      searchLoading: true,
      searchError: 'City not found'
    };

    render(<MainContent {...props} />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('data-location', 'Paris');
    expect(searchInput).toHaveAttribute('data-loading', 'true');
    expect(searchInput).toHaveAttribute('data-error', 'City not found');
  });

  it('should show loading skeleton when loading is true', () => {
    render(<MainContent {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('weather-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('weekly-forecast')).not.toBeInTheDocument();
    expect(screen.queryByTestId('weather-chart')).not.toBeInTheDocument();
  });

  it('should show weather components when not loading', () => {
    const weatherData = { name: 'Paris', temp: 22 };
    const forecastData = [{ date: '2024-01-01', temp: 20 }];

    render(
      <MainContent 
        {...defaultProps} 
        weatherData={weatherData}
        forecastData={forecastData}
        loading={false}
      />
    );

    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-forecast')).toBeInTheDocument();
    expect(screen.getByTestId('weather-chart')).toBeInTheDocument();
  });

  it('should pass weather data correctly to components', () => {
    const weatherData = { name: 'London', temp: 18 };
    const forecastData = [
      { date: '2024-01-01', temp: 18 },
      { date: '2024-01-02', temp: 20 }
    ];

    render(
      <MainContent 
        {...defaultProps} 
        weatherData={weatherData}
        forecastData={forecastData}
      />
    );

    const weatherDisplay = screen.getByTestId('weather-display');
    expect(weatherDisplay).toHaveAttribute('data-city', 'London');

    const weeklyForecast = screen.getByTestId('weekly-forecast');
    expect(weeklyForecast).toHaveAttribute('data-forecast-length', '2');

    const weatherChart = screen.getByTestId('weather-chart');
    expect(weatherChart).toHaveAttribute('data-forecast-length', '2');
    expect(weatherChart).toHaveAttribute('data-current-city', 'London');
  });

  it('should have proper container structure', () => {
    render(<MainContent {...defaultProps} />);

    const container = screen.getByTestId('search-input').parentElement;
    expect(container).toHaveClass('container');

    const weatherContent = container.querySelector('.weather-content');
    expect(weatherContent).toBeInTheDocument();
  });

  it('should handle empty weather data gracefully', () => {
    render(
      <MainContent 
        {...defaultProps} 
        weatherData={{}}
        forecastData={[]}
      />
    );

    const weatherDisplay = screen.getByTestId('weather-display');
    expect(weatherDisplay).toHaveAttribute('data-city', '');

    const weeklyForecast = screen.getByTestId('weekly-forecast');
    expect(weeklyForecast).toHaveAttribute('data-forecast-length', '0');
  });

  it('should toggle between loading and content states', () => {
    const { rerender } = render(<MainContent {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('weather-display')).not.toBeInTheDocument();

    rerender(<MainContent {...defaultProps} loading={false} />);

    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
  });

  it('should handle search input state changes', () => {
    const { rerender } = render(<MainContent {...defaultProps} />);

    let searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('data-location', '');
    expect(searchInput).toHaveAttribute('data-loading', 'false');

    rerender(
      <MainContent 
        {...defaultProps} 
        location="New York"
        searchLoading={true}
      />
    );

    searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('data-location', 'New York');
    expect(searchInput).toHaveAttribute('data-loading', 'true');
  });
});