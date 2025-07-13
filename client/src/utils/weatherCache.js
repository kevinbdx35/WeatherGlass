class WeatherCache {
  constructor(maxSize = 20, ttl = 10 * 60 * 1000) { // 10 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const normalizedKey = key.toLowerCase().trim();
    const item = this.cache.get(normalizedKey);
    
    if (!item) return null;
    
    const isExpired = Date.now() - item.timestamp > this.ttl;
    
    if (isExpired) {
      this.cache.delete(normalizedKey);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    const normalizedKey = key.toLowerCase().trim();
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(normalizedKey, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export default WeatherCache;