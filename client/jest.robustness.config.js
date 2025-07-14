/**
 * Configuration Jest spéciale pour les tests de robustesse
 * Ces tests sont conçus pour prévenir les erreurs de production
 */

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Tests critiques de sécurité
  testMatch: [
    '<rootDir>/src/**/*robustness*.test.js',
    '<rootDir>/src/**/*critical*.test.js',
    '<rootDir>/src/**/*variance-error*.test.js'
  ],
  
  // Configuration stricte pour détecter les erreurs
  errorOnDeprecated: true,
  verbose: true,
  
  // Échec sur les erreurs console
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js',
    '<rootDir>/jest.errorOnConsole.js'
  ],
  
  // Couverture de code pour les composants critiques
  collectCoverageFrom: [
    'src/components/DataQualityCard.js',
    'src/components/DataQualityBadge.js',
    'src/services/weatherAggregator.js',
    'src/hooks/useWeatherData.js'
  ],
  
  // Seuils de couverture élevés pour les composants critiques
  coverageThreshold: {
    'src/components/DataQualityCard.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/services/weatherAggregator.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};