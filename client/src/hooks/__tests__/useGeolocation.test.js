import { renderHook, act } from '@testing-library/react-hooks';
import useGeolocation from '../useGeolocation';

// Mock de la géolocalisation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

// Mock du hook useTranslation
const mockT = (key) => {
  const translations = {
    'search.errors.geolocationDenied': 'Géolocalisation refusée',
    'search.errors.geolocationUnavailable': 'Géolocalisation indisponible',
    'search.errors.geolocationTimeout': 'Timeout de géolocalisation',
    'search.errors.geolocationError': 'Erreur de géolocalisation'
  };
  return translations[key] || key;
};

describe('useGeolocation', () => {
  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Mock de navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });
  });

  afterEach(() => {
    // Nettoyage - Restaurer plutôt que supprimer
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useGeolocation(mockT));

    expect(result.current.location).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSupported).toBe(true);
    expect(typeof result.current.getCurrentLocation).toBe('function');
  });

  it('should detect when geolocation is not supported', () => {
    // Simuler un navigateur non compatible
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    expect(result.current.isSupported).toBe(false);
  });

  it('should handle successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      setTimeout(() => success(mockPosition), 0);
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(result.current.loading).toBe(true);

    // Attendre que la géolocalisation se termine
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toEqual({
      latitude: 48.8566,
      longitude: 2.3522
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle geolocation permission denied', async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied the request for Geolocation.'
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    act(() => {
      result.current.getCurrentLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Géolocalisation refusée');
  });

  it('should handle geolocation position unavailable', async () => {
    const mockError = {
      code: 2, // POSITION_UNAVAILABLE
      message: 'Position unavailable.'
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    act(() => {
      result.current.getCurrentLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.error).toBe('Géolocalisation indisponible');
  });

  it('should handle geolocation timeout', async () => {
    const mockError = {
      code: 3, // TIMEOUT
      message: 'Timeout expired.'
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      setTimeout(() => error(mockError), 0);
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    act(() => {
      result.current.getCurrentLocation();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.error).toBe('Timeout de géolocalisation');
  });

  it('should not call getCurrentPosition when not supported', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true
    });

    const { result } = renderHook(() => useGeolocation(mockT));

    act(() => {
      result.current.getCurrentLocation();
    });

    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
  });
});