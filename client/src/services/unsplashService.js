class UnsplashService {
  constructor() {
    // Clé API depuis les variables d'environnement
    this.accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'https://api.unsplash.com';
    this.cache = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 heure
  }

  // Mapper les conditions météo vers des mots-clés de recherche en fonction de l'heure et de la saison
  getWeatherKeywords(weatherCondition, timeOfDay = 'day', season = 'spring') {
    // Mots-clés de base pour chaque saison
    const seasonKeywords = {
      'spring': 'spring blooming flowers green fresh',
      'summer': 'summer bright warm sunny hot',
      'autumn': 'autumn fall orange yellow leaves',
      'winter': 'winter cold snow white frost'
    };
    const keywordMap = {
      'Clear': {
        'day': 'sunny clear blue sky sunshine bright',
        'night': 'clear night sky stars starry night',
        'sunrise': 'sunrise clear sky golden hour morning',
        'sunset': 'sunset clear sky golden hour evening'
      },
      'Clouds': {
        'day': 'cloudy overcast gray sky daytime',
        'night': 'cloudy night overcast dark sky',
        'sunrise': 'cloudy sunrise morning overcast',
        'sunset': 'cloudy sunset evening overcast'
      },
      'Rain': {
        'day': 'rain rainy day storm raindrops',
        'night': 'rain night storm dark rainy',
        'sunrise': 'rain morning storm wet',
        'sunset': 'rain evening storm wet'
      },
      'Drizzle': {
        'day': 'light rain drizzle mist day',
        'night': 'drizzle night light rain mist',
        'sunrise': 'morning drizzle light rain',
        'sunset': 'evening drizzle light rain'
      },
      'Thunderstorm': {
        'day': 'thunderstorm lightning storm dramatic',
        'night': 'night thunderstorm lightning dark storm',
        'sunrise': 'morning thunderstorm lightning',
        'sunset': 'evening thunderstorm lightning'
      },
      'Snow': {
        'day': 'snow winter snowy white day',
        'night': 'snow night winter snowy dark',
        'sunrise': 'snow sunrise winter morning',
        'sunset': 'snow sunset winter evening'
      },
      'Mist': {
        'day': 'misty fog morning day atmospheric',
        'night': 'misty night fog atmospheric',
        'sunrise': 'morning mist fog sunrise',
        'sunset': 'evening mist fog sunset'
      },
      'Fog': {
        'day': 'fog misty weather day atmospheric',
        'night': 'fog night misty dark atmospheric',
        'sunrise': 'morning fog misty sunrise',
        'sunset': 'evening fog misty sunset'
      },
      'Haze': {
        'day': 'hazy atmosphere day soft light',
        'night': 'hazy night atmosphere soft',
        'sunrise': 'hazy sunrise morning atmospheric',
        'sunset': 'hazy sunset evening atmospheric'
      },
      'Dust': {
        'day': 'dusty atmosphere day hazy',
        'night': 'dusty night atmosphere',
        'sunrise': 'dusty sunrise morning',
        'sunset': 'dusty sunset evening'
      },
      'Sand': {
        'day': 'sandstorm desert day',
        'night': 'sandstorm desert night',
        'sunrise': 'desert sunrise sandstorm',
        'sunset': 'desert sunset sandstorm'
      },
      'Ash': {
        'day': 'volcanic ash day atmospheric',
        'night': 'volcanic ash night dark',
        'sunrise': 'volcanic ash sunrise',
        'sunset': 'volcanic ash sunset'
      },
      'Squall': {
        'day': 'windy storm day dramatic',
        'night': 'windy storm night dark',
        'sunrise': 'windy storm sunrise',
        'sunset': 'windy storm sunset'
      },
      'Tornado': {
        'day': 'tornado storm day dramatic',
        'night': 'tornado storm night dark',
        'sunrise': 'tornado storm sunrise',
        'sunset': 'tornado storm sunset'
      }
    };

    // Obtenir les mots-clés météo de base
    const weatherKeywords = keywordMap[weatherCondition];
    const baseKeywords = weatherKeywords?.[timeOfDay] || weatherKeywords?.day || 'nature weather';
    
    // Ajouter les mots-clés saisonniers
    const seasonalKeywords = seasonKeywords[season] || seasonKeywords['spring'];
    
    // Combiner météo + saison + quelques adaptations spécifiques
    let combinedKeywords = `${baseKeywords} ${seasonalKeywords}`;
    
    // Adaptations spécifiques saison + météo pour de meilleurs résultats
    if (season === 'winter') {
      if (weatherCondition === 'Clear' && timeOfDay === 'day') {
        combinedKeywords += ' crisp winter sunshine snow landscape';
      } else if (weatherCondition === 'Snow') {
        combinedKeywords += ' blizzard snowfall winter landscape';
      }
    } else if (season === 'spring') {
      if (weatherCondition === 'Clear') {
        combinedKeywords += ' cherry blossom sakura green grass';
      } else if (weatherCondition === 'Rain') {
        combinedKeywords += ' april showers fresh green nature';
      }
    } else if (season === 'summer') {
      if (weatherCondition === 'Clear') {
        combinedKeywords += ' beach ocean vacation blue sky';
      } else if (weatherCondition === 'Thunderstorm') {
        combinedKeywords += ' summer storm tropical dramatic';
      }
    } else if (season === 'autumn') {
      if (weatherCondition === 'Clear') {
        combinedKeywords += ' autumn foliage golden red maple';
      } else if (weatherCondition === 'Mist' || weatherCondition === 'Fog') {
        combinedKeywords += ' autumn fog mysterious forest';
      }
    }
    
    return combinedKeywords;
  }

  // Déterminer la saison en fonction de la date et de l'hémisphère
  getSeason(date = new Date(), latitude = null) {
    const month = date.getMonth(); // 0 = janvier, 11 = décembre
    const day = date.getDate();
    
    // Déterminer l'hémisphère basé sur la latitude (si disponible)
    const isNorthernHemisphere = latitude === null || latitude >= 0;
    
    // Dates approximatives des saisons pour l'hémisphère nord
    let season = 'spring'; // par défaut
    
    if (isNorthernHemisphere) {
      // Hémisphère Nord
      if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
        season = 'winter'; // Hiver: 21 déc - 19 mars
      } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
        season = 'spring'; // Printemps: 20 mars - 20 juin
      } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
        season = 'summer'; // Été: 21 juin - 22 septembre
      } else {
        season = 'autumn'; // Automne: 23 septembre - 20 décembre
      }
    } else {
      // Hémisphère Sud (saisons inversées)
      if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
        season = 'summer'; // Été: 21 déc - 19 mars
      } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
        season = 'autumn'; // Automne: 20 mars - 20 juin
      } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
        season = 'winter'; // Hiver: 21 juin - 22 septembre
      } else {
        season = 'spring'; // Printemps: 23 septembre - 20 décembre
      }
    }
    
    return season;
  }

  // Déterminer l'heure de la journée avec plus de précision
  getTimeOfDay(sunrise = null, sunset = null, timezone = 0) {
    const now = new Date();
    const currentTime = now.getTime();
    
    // Si on a les données de lever/coucher du soleil, les utiliser
    if (sunrise && sunset) {
      const sunriseTime = (sunrise + timezone) * 1000; // Convertir en millisecondes et ajuster timezone
      const sunsetTime = (sunset + timezone) * 1000;
      
      // Calculer les périodes de transition (1h avant/après lever/coucher)
      const sunriseTransition = 60 * 60 * 1000; // 1 heure en millisecondes
      const sunsetTransition = 60 * 60 * 1000;
      
      // Période de lever de soleil (1h avant et après)
      if (currentTime >= (sunriseTime - sunriseTransition) && currentTime <= (sunriseTime + sunriseTransition)) {
        return 'sunrise';
      }
      
      // Période de coucher de soleil (1h avant et après)
      if (currentTime >= (sunsetTime - sunsetTransition) && currentTime <= (sunsetTime + sunsetTransition)) {
        return 'sunset';
      }
      
      // Jour (entre lever et coucher du soleil)
      if (currentTime > (sunriseTime + sunriseTransition) && currentTime < (sunsetTime - sunsetTransition)) {
        return 'day';
      }
      
      // Nuit (le reste du temps)
      return 'night';
    }
    
    // Fallback vers la logique d'heure simple si pas de données solaires
    const hour = now.getHours();
    
    // Lever de soleil approximatif (6h-8h)
    if (hour >= 6 && hour < 8) {
      return 'sunrise';
    }
    
    // Coucher de soleil approximatif (18h-20h)
    if (hour >= 18 && hour < 20) {
      return 'sunset';
    }
    
    // Jour (8h-18h)
    if (hour >= 8 && hour < 18) {
      return 'day';
    }
    
    // Nuit (20h-6h)
    return 'night';
  }

  // Rechercher une image selon les conditions météo
  async searchWeatherImage(weatherCondition, city = '', sunData = null) {
    // Extraire les données solaires et géographiques si disponibles
    const sunrise = sunData?.sunrise || null;
    const sunset = sunData?.sunset || null;
    const timezone = sunData?.timezone || 0;
    const latitude = sunData?.latitude || null; // Pour déterminer l'hémisphère
    
    const timeOfDay = this.getTimeOfDay(sunrise, sunset, timezone);
    const season = this.getSeason(new Date(), latitude);
    
    try {
      const keywords = this.getWeatherKeywords(weatherCondition, timeOfDay, season);
      const searchQuery = city ? `${keywords} ${city}` : keywords;
      
      // Vérifier le cache (inclure timeOfDay ET season dans la clé)
      const cacheKey = `${weatherCondition}_${timeOfDay}_${season}_${city}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      // Si pas de clé API, retourner une image par défaut
      if (!this.accessKey) {
        console.warn('Clé API Unsplash manquante. Utilisation des images de fallback.');
        return this.getFallbackImage(weatherCondition, timeOfDay, season);
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
        return this.getFallbackImage(weatherCondition, timeOfDay, season);
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'image Unsplash:', error);
      return this.getFallbackImage(weatherCondition, timeOfDay, season);
    }
  }

  // Images de fallback en cas d'erreur avec support jour/nuit et saisons
  getFallbackImage(weatherCondition, timeOfDay = 'day', season = 'spring') {
    // Images par saison pour une meilleure contextualisation
    const seasonalFallbackImages = {
      'spring': {
        'Clear': {
          'day': 'https://images.unsplash.com/photo-1524749292158-7540c2494485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Spring day clear
          'night': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Night stars
          'sunrise': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Spring sunrise
          'sunset': 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Spring sunset
        },
        'Rain': {
          'day': 'https://images.unsplash.com/photo-1493314894560-5c412a56c17c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Spring rain
          'night': 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Night rain
          'sunrise': 'https://images.unsplash.com/photo-1493314894560-5c412a56c17c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          'sunset': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }
      },
      'summer': {
        'Clear': {
          'day': 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Summer clear day
          'night': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Summer night
          'sunrise': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Summer sunrise
          'sunset': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Summer sunset
        },
        'Thunderstorm': {
          'day': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Summer storm
          'night': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Night storm
          'sunrise': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          'sunset': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }
      },
      'autumn': {
        'Clear': {
          'day': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Autumn clear
          'night': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Autumn night
          'sunrise': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Autumn sunrise
          'sunset': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Autumn sunset
        },
        'Mist': {
          'day': 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Autumn mist
          'night': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Autumn night mist
          'sunrise': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          'sunset': 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }
      },
      'winter': {
        'Clear': {
          'day': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter clear
          'night': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter night
          'sunrise': 'https://images.unsplash.com/photo-1551524164-6cf2ac357f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter sunrise
          'sunset': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Winter sunset
        },
        'Snow': {
          'day': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter snow day
          'night': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter snow night
          'sunrise': 'https://images.unsplash.com/photo-1551524164-6cf2ac357f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Winter snow sunrise
          'sunset': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' // Winter snow sunset
        }
      }
    };

    // Images génériques de fallback si pas d'image saisonnière spécifique
    const genericFallbackImages = {
      'Clear': {
        'day': 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'night': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunrise': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunset': 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
      },
      'Clouds': {
        'day': 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'night': 'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunrise': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunset': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
      },
      'Rain': {
        'day': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'night': 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunrise': 'https://images.unsplash.com/photo-1493314894560-5c412a56c17c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        'sunset': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
      }
    };

    // Essayer d'abord les images saisonnières spécifiques
    let selectedUrl = null;
    const seasonalImages = seasonalFallbackImages[season];
    
    if (seasonalImages && seasonalImages[weatherCondition]) {
      const weatherSeasonImages = seasonalImages[weatherCondition];
      selectedUrl = weatherSeasonImages[timeOfDay] || weatherSeasonImages['day'];
    }
    
    // Si pas d'image saisonnière, utiliser les images génériques
    if (!selectedUrl) {
      const genericImages = genericFallbackImages[weatherCondition] || genericFallbackImages['Clear'];
      selectedUrl = genericImages[timeOfDay] || genericImages['day'];
    }

    return {
      url: selectedUrl,
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