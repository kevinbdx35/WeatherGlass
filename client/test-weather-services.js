const axios = require('axios');

// Test Open-Meteo (source principale - aucune clé requise)
async function testOpenMeteo() {
  console.log('🧪 Test Open-Meteo...');
  try {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: 48.8566,
      longitude: 2.3522,
      current: ['temperature_2m', 'relative_humidity_2m', 'weather_code'],
      daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'],
      timezone: 'auto'
    };
    
    const response = await axios.get(url, { params, timeout: 5000 });
    console.log('✅ Open-Meteo OK:', response.data.current.temperature_2m + '°C');
    return true;
  } catch (error) {
    console.log('❌ Open-Meteo ERREUR:', error.message);
    return false;
  }
}

// Test OpenWeatherMap (fallback legacy avec clé existante)
async function testOpenWeatherMap() {
  console.log('🧪 Test OpenWeatherMap...');
  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = {
      lat: 48.8566,
      lon: 2.3522,
      appid: '6c340e80b8feccd3cda97f5924a86d8a',
      units: 'metric'
    };
    
    const response = await axios.get(url, { params, timeout: 5000 });
    console.log('✅ OpenWeatherMap OK:', response.data.main.temp + '°C');
    return true;
  } catch (error) {
    console.log('❌ OpenWeatherMap ERREUR:', error.message);
    return false;
  }
}

// Test WeatherAPI (backup avec clé demo)
async function testWeatherAPI() {
  console.log('🧪 Test WeatherAPI...');
  try {
    const url = 'https://api.weatherapi.com/v1/current.json';
    const params = {
      key: 'demo_key_get_your_free_key_at_weatherapi.com',
      q: '48.8566,2.3522',
      aqi: 'no'
    };
    
    const response = await axios.get(url, { params, timeout: 5000 });
    console.log('✅ WeatherAPI OK:', response.data.current.temp_c + '°C');
    return true;
  } catch (error) {
    console.log('❌ WeatherAPI ERREUR:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Diagnostic des sources météo...\n');
  
  const openMeteoOK = await testOpenMeteo();
  const openWeatherMapOK = await testOpenWeatherMap();
  const weatherApiOK = await testWeatherAPI();
  
  console.log('\n📊 Résultats:');
  console.log('Open-Meteo (principal):', openMeteoOK ? '✅' : '❌');
  console.log('OpenWeatherMap (legacy):', openWeatherMapOK ? '✅' : '❌');
  console.log('WeatherAPI (backup):', weatherApiOK ? '✅' : '❌');
  
  if (openMeteoOK || openWeatherMapOK) {
    console.log('\n✅ Au moins une source fonctionne - l\'app devrait marcher');
  } else {
    console.log('\n❌ Aucune source ne fonctionne - problème réseau ou clés');
  }
}

runTests().catch(console.error);