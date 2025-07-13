class UnsplashService {
  constructor() {
    // Clé API depuis les variables d'environnement
    this.accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'https://api.unsplash.com';
    this.cache = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 heure
  }

  // Mapper les conditions météo vers des mots-clés de recherche
  getWeatherKeywords(weatherCondition, timeOfDay = 'day') {
    const keywordMap = {
      'Clear': timeOfDay === 'night' ? 'clear night sky stars' : 'sunny blue sky',
      'Clouds': 'cloudy sky overcast',
      'Rain': 'rain storm weather',
      'Drizzle': 'light rain drizzle',
      'Thunderstorm': 'thunderstorm lightning storm',
      'Snow': 'snow winter snowy',
      'Mist': 'misty fog morning',
      'Fog': 'fog misty weather',
      'Haze': 'hazy atmosphere',
      'Dust': 'dusty atmosphere',
      'Sand': 'sandstorm desert',
      'Ash': 'volcanic ash',
      'Squall': 'windy storm',
      'Tornado': 'tornado storm'
    };

    return keywordMap[weatherCondition] || 'nature weather';
  }

  // Déterminer si c'est le jour ou la nuit
  getTimeOfDay() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 20) ? 'day' : 'night';
  }

  // Rechercher une image selon les conditions météo
  async searchWeatherImage(weatherCondition, city = '') {
    try {
      const timeOfDay = this.getTimeOfDay();
      const keywords = this.getWeatherKeywords(weatherCondition, timeOfDay);
      const searchQuery = city ? `${keywords} ${city}` : keywords;
      
      // Vérifier le cache
      const cacheKey = `${weatherCondition}_${timeOfDay}_${city}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      // Si pas de clé API, retourner une image par défaut
      if (!this.accessKey) {
        console.warn('Clé API Unsplash manquante. Utilisation des images de fallback.');
        return this.getFallbackImage(weatherCondition);
      }

      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape&client_id=${this.accessKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Prendre une image aléatoire parmi les 10 premières
        const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
        const selectedImage = data.results[randomIndex];
        
        const imageData = {
          url: selectedImage.urls.regular,
          thumb: selectedImage.urls.thumb,
          author: selectedImage.user.name,
          authorUrl: selectedImage.user.links.html,
          downloadUrl: selectedImage.links.download_location
        };

        // Mettre en cache
        this.cache.set(cacheKey, {
          data: imageData,
          timestamp: Date.now()
        });

        return imageData;
      } else {
        return this.getFallbackImage(weatherCondition);
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'image Unsplash:', error);
      return this.getFallbackImage(weatherCondition);
    }
  }

  // Images de fallback en cas d'erreur
  getFallbackImage(weatherCondition) {
    const fallbackImages = {
      'Clear': 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'Clouds': 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'Rain': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'Thunderstorm': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'Snow': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      'Mist': 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    };

    return {
      url: fallbackImages[weatherCondition] || fallbackImages['Clear'],
      author: 'Unsplash',
      authorUrl: 'https://unsplash.com',
      downloadUrl: null
    };
  }

  // Précharger une image avec timeout
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId;
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Erreur de chargement d\'image'));
      };
      
      // Timeout de 10 secondes
      timeoutId = setTimeout(() => {
        reject(new Error('Timeout de chargement d\'image'));
      }, 10000);
      
      img.src = url;
    });
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
  }

  // Obtenir la taille du cache
  getCacheSize() {
    return this.cache.size;
  }
}

export default new UnsplashService();