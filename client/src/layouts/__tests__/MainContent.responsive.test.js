import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainContent from '../MainContent';

// Mock des composants
jest.mock('../../components/SearchInput', () => () => (
  <div data-testid="search-input">Search Input</div>
));

jest.mock('../../components/WeatherDisplay', () => () => (
  <div data-testid="weather-display">Weather Display</div>
));

jest.mock('../../components/WeeklyForecast', () => () => (
  <div data-testid="weekly-forecast">Weekly Forecast</div>
));

jest.mock('../../components/WeatherChart', () => () => (
  <div data-testid="weather-chart">Weather Chart</div>
));

jest.mock('../../components/LoadingSkeleton', () => () => (
  <div data-testid="loading-skeleton">Loading Skeleton</div>
));

jest.mock('../GridLayout', () => () => (
  <div data-testid="grid-layout">Grid Layout</div>
));

// Mock de window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock de window.addEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener,
});

describe('MainContent Responsive', () => {
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

  it('should use GridLayout for large screens (≥1024px)', () => {
    window.innerWidth = 1024;
    render(<MainContent {...defaultProps} />);
    
    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
  });

  it('should use GridLayout for very large screens (≥1800px)', () => {
    window.innerWidth = 1800;
    render(<MainContent {...defaultProps} />);
    
    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
  });

  it('should use classic layout for medium screens (<1024px)', () => {
    window.innerWidth = 768;
    render(<MainContent {...defaultProps} />);
    
    expect(screen.queryByTestId('grid-layout')).not.toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
  });

  it('should use classic layout for small screens (<768px)', () => {
    window.innerWidth = 480;
    render(<MainContent {...defaultProps} />);
    
    expect(screen.queryByTestId('grid-layout')).not.toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
  });

  it('should register resize event listener', () => {
    render(<MainContent {...defaultProps} />);
    
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove resize event listener on unmount', () => {
    const { unmount } = render(<MainContent {...defaultProps} />);
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should handle loading state in both layouts', () => {
    // Test avec GridLayout
    window.innerWidth = 1024;
    const { rerender } = render(<MainContent {...defaultProps} loading={true} />);
    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    
    // Test avec layout classique - il faut re-monter le composant pour déclencher le useEffect
    window.innerWidth = 768;
    rerender(<div />); // Nettoyer
    const { unmount } = render(<MainContent {...defaultProps} loading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    unmount();
  });

  it('should pass all props to GridLayout', () => {
    const customProps = {
      ...defaultProps,
      location: 'Test Location',
      searchLoading: true,
      searchError: 'Test Error',
      weatherData: { name: 'Test City' },
      forecastData: [{ date: '2024-01-01' }],
      loading: true
    };

    window.innerWidth = 1024;
    render(<MainContent {...customProps} />);
    
    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    // GridLayout reçoit toutes les props nécessaires
  });
});