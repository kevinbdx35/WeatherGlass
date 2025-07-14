import WeatherCache from '../weatherCache';

describe('WeatherCache', () => {
  let cache;

  beforeEach(() => {
    cache = new WeatherCache();
  });

  afterEach(() => {
    if (cache) {
      cache.clear();
    }
  });

  describe('Basic functionality', () => {
    it('should store and retrieve data correctly', () => {
      const testData = { temp: 25, city: 'Paris' };
      const key = 'test-key';

      cache.set(key, testData);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should overwrite existing data', () => {
      const key = 'test-key';
      const firstData = { temp: 20 };
      const secondData = { temp: 25 };

      cache.set(key, firstData);
      cache.set(key, secondData);

      expect(cache.get(key)).toEqual(secondData);
    });
  });

  describe('Expiration', () => {
    it('should expire data after timeout', async () => {
      const testData = { temp: 25 };
      const key = 'test-key';
      
      // Créer un cache avec un timeout très court (10ms)
      const shortCache = new WeatherCache(20, 10); // maxSize, ttl en ms
      
      shortCache.set(key, testData);
      
      // Vérifier que les données sont là initialement
      expect(shortCache.get(key)).toEqual(testData);
      
      // Attendre que le cache expire
      await new Promise(resolve => setTimeout(resolve, 15));
      
      const result = shortCache.get(key);
      expect(result).toBeNull();
    });

    it('should return data within timeout period', () => {
      const testData = { temp: 25 };
      const key = 'test-key';
      
      // Cache avec timeout long (maxSize, ttl)
      const longCache = new WeatherCache(20, 60000); // 1 minute
      
      longCache.set(key, testData);
      const result = longCache.get(key);
      
      expect(result).toEqual(testData);
    });
  });

  describe('Memory cache behavior', () => {
    it('should normalize keys correctly', () => {
      const testData = { temp: 25 };
      
      cache.set('  PARIS  ', testData);
      
      // Les clés devraient être normalisées (lowercase + trim)
      expect(cache.get('paris')).toEqual(testData);
      expect(cache.get(' Paris ')).toEqual(testData);
      expect(cache.get('PARIS')).toEqual(testData);
    });

    it('should respect maximum cache size', () => {
      const smallCache = new WeatherCache(2); // maxSize = 2
      
      smallCache.set('key1', { data: 1 });
      smallCache.set('key2', { data: 2 });
      smallCache.set('key3', { data: 3 }); // Devrait évincer key1
      
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toEqual({ data: 2 });
      expect(smallCache.get('key3')).toEqual({ data: 3 });
      expect(smallCache.size()).toBe(2);
    });

    it('should provide correct cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', { data: 1 });
      expect(cache.size()).toBe(1);
      
      cache.set('key2', { data: 2 });
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Clear functionality', () => {
    it('should clear all cache data', () => {
      cache.set('key1', { temp: 20 });
      cache.set('key2', { temp: 25 });

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle null data', () => {
      cache.set('null-key', null);
      expect(cache.get('null-key')).toBe(null);
    });

    it('should handle undefined data', () => {
      cache.set('undefined-key', undefined);
      expect(cache.get('undefined-key')).toBe(undefined);
    });

    it('should handle empty objects', () => {
      const emptyObject = {};
      cache.set('empty-key', emptyObject);
      expect(cache.get('empty-key')).toEqual(emptyObject);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        weather: {
          current: { temp: 25, humidity: 60 },
          forecast: [
            { day: 'Monday', temp: 22 },
            { day: 'Tuesday', temp: 24 }
          ]
        },
        location: { lat: 48.8566, lon: 2.3522 }
      };

      cache.set('complex-key', complexData);
      expect(cache.get('complex-key')).toEqual(complexData);
    });

    it('should handle empty keys gracefully', () => {
      cache.set('', { data: 'test' });
      expect(cache.get('')).toEqual({ data: 'test' });
    });

    it('should handle special characters in keys', () => {
      const testData = { temp: 25 };
      const specialKey = 'city-with-special&chars@123';
      
      cache.set(specialKey, testData);
      expect(cache.get(specialKey)).toEqual(testData);
    });
  });
});