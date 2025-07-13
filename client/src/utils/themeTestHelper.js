// Utilitaire pour tester le mode automatique selon l'heure
// À utiliser uniquement en développement

export const getThemeByTime = (hour = new Date().getHours()) => {
  // Mode sombre de 19h à 7h (7pm à 7am)
  return (hour >= 19 || hour < 7) ? 'dark' : 'light';
};

// Fonction pour tester différentes heures
export const testAutoTheme = () => {
  console.log('=== Test du mode automatique WeatherGlass ===');
  
  const testHours = [
    { hour: 6, expected: 'dark', time: '06:00 (matin)' },
    { hour: 7, expected: 'light', time: '07:00 (matin)' },
    { hour: 12, expected: 'light', time: '12:00 (midi)' },
    { hour: 18, expected: 'light', time: '18:00 (soir)' },
    { hour: 19, expected: 'dark', time: '19:00 (soir)' },
    { hour: 22, expected: 'dark', time: '22:00 (nuit)' },
    { hour: 0, expected: 'dark', time: '00:00 (minuit)' },
    { hour: 3, expected: 'dark', time: '03:00 (nuit)' }
  ];
  
  testHours.forEach(test => {
    const result = getThemeByTime(test.hour);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.time}: ${result} (attendu: ${test.expected})`);
  });
  
  const currentHour = new Date().getHours();
  const currentTheme = getThemeByTime(currentHour);
  console.log(`\n🌍 Heure actuelle: ${currentHour}:00 → Thème: ${currentTheme}`);
  
  console.log('\n📋 Horaires du mode automatique:');
  console.log('☀️ Mode clair: 07:00 - 18:59');
  console.log('🌙 Mode sombre: 19:00 - 06:59');
};

// Exporté pour être utilisé dans la console
if (typeof window !== 'undefined') {
  window.testAutoTheme = testAutoTheme;
  window.getThemeByTime = getThemeByTime;
}