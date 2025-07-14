// Test direct de l'agrégateur
const WeatherAggregator = require('./src/services/weatherAggregator.js').default;

async function testAggregator() {
  console.log('🧪 Test direct de l\'agrégateur...');
  
  const aggregator = new WeatherAggregator();
  
  // Mock du service legacy pour le test
  const mockLegacyService = {
    async getWeatherByCoords(lat, lon, language) {
      const axios = require('axios');
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
      const response = await axios.get(url);
      return response.data;
    },
    async getWeatherByCity(cityName, language) {
      const axios = require('axios');
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&lang=${language}&appid=6c340e80b8feccd3cda97f5924a86d8a&units=metric`;
      const response = await axios.get(url);
      return response.data;
    },
    async checkAvailability() {
      return true;
    },
    getUsageStats() {
      return {
        name: 'OpenWeatherMap',
        dailyQuota: 1000,
        monthlyCost: 0,
        isAvailable: true,
        features: ['Current Weather', 'Forecasts', 'Global Coverage']
      };
    }
  };
  
  aggregator.setLegacyService(mockLegacyService);
  
  try {
    console.log('Test avec coordonnées Paris...');
    const result = await aggregator.getWeatherByCoords(48.8566, 2.3522, 'fr');
    console.log('✅ Données reçues:', {
      city: result.name,
      temp: result.main?.temp,
      source: result.aggregator?.usedSource
    });
    
    console.log('Test avec nom de ville...');
    const result2 = await aggregator.getWeatherByCity('Paris', 'fr');
    console.log('✅ Données reçues:', {
      city: result2.name,
      temp: result2.main?.temp,
      source: result2.aggregator?.usedSource
    });
    
  } catch (error) {
    console.log('❌ Erreur agrégateur:', error.message);
    console.log('Stack:', error.stack);
  }
}

testAggregator().catch(console.error);