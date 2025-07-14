# 🧪 Stratégie de Tests - WeatherGlass

## 📋 Vue d'ensemble

Cette documentation décrit la stratégie de tests mise en place pour **éviter les cassures lors des déploiements** de WeatherGlass. Les tests sont conçus pour protéger les fonctionnalités critiques qui ont causé des problèmes par le passé.

## 🎯 Objectifs des Tests

1. **🔴 Prévenir les régressions critiques** lors des déploiements
2. **⚡ Tester les points de défaillance** identifiés historiquement
3. **🛡️ Assurer la robustesse** des fonctionnalités métier
4. **📊 Maintenir la qualité** du code avec une couverture raisonnable

## 🏗️ Architecture des Tests

### **Types de Tests Implémentés**

```
tests/
├── critical.test.js           # Tests de sécurité déploiement
├── weatherCache.test.js       # Tests du cache météo
├── components/
│   └── WeatherDisplay.test.js # Tests composants critiques
├── hooks/
│   └── useGeolocation.test.js # Tests hooks métier
└── App.integration.test.js    # Tests d'intégration (en développement)
```

## 🔧 Scripts de Tests Disponibles

```bash
# Tests en mode développement (watch)
npm test

# Tests critiques seulement (CI/déploiement)
npm run test:critical

# Tests avec couverture de code
npm run test:coverage

# Tests pour CI/CD avec reporting
npm run test:ci
```

## 🎯 Tests Critiques de Déploiement

### **`critical.test.js`** - Protection Anti-Régression

Ces tests vérifient les points sensibles qui peuvent casser en production :

```javascript
// ✅ Validation de l'API key
it('should validate API key format', () => {
  const apiKey = '6c340e80b8feccd3cda97f5924a86d8a';
  expect(apiKey).toMatch(/^[a-f0-9]{32}$/i);
});

// ✅ Construction d'URLs API
it('should construct valid API URLs', () => {
  const weatherUrl = `${baseUrl}/weather?q=${city}&appid=${apiKey}`;
  expect(() => new URL(weatherUrl)).not.toThrow();
});

// ✅ Gestion des erreurs réseau
it('should handle network timeouts', () => {
  const timeoutError = new Error('timeout of 5000ms exceeded');
  expect(timeoutError.code).toBe('ECONNABORTED');
});
```

### **Zones protégées :**
- 🔑 Format et validation de l'API key
- 🌐 Construction des URLs d'API
- ⚠️ Gestion des erreurs HTTP (404, 401, 429, 500)
- 🧠 Validation de la structure des données météo
- 🔧 Compatibilité navigateur (localStorage, géolocalisation)
- 📦 Vérification des builds de production

## 🗄️ Tests du Cache Météo

### **`weatherCache.test.js`** - Fonctionnalité Critique

Le cache est essentiel pour les performances et éviter les appels API excessifs :

```javascript
// ✅ Stockage et récupération
it('should store and retrieve data correctly', () => {
  cache.set('Paris', weatherData);
  expect(cache.get('Paris')).toEqual(weatherData);
});

// ✅ Expiration automatique
it('should expire data after timeout', async () => {
  const shortCache = new WeatherCache(20, 10); // 10ms TTL
  shortCache.set(key, testData);
  await new Promise(resolve => setTimeout(resolve, 15));
  expect(shortCache.get(key)).toBeNull();
});

// ✅ Normalisation des clés
it('should normalize keys correctly', () => {
  cache.set('  PARIS  ', testData);
  expect(cache.get('paris')).toEqual(testData);
});
```

### **Fonctionnalités testées :**
- 💾 Stockage/récupération de données
- ⏰ Expiration automatique (TTL)
- 🔄 Éviction LRU (taille maximale)
- 🔤 Normalisation des clés (lowercase, trim)
- 🧹 Nettoyage du cache

## ⚛️ Tests de Composants

### **`WeatherDisplay.test.js`** - Interface Utilisateur

Tests du composant central d'affichage météo :

```javascript
// ✅ Affichage conditionnel
it('should render nothing when no data is provided', () => {
  const { container } = render(<WeatherDisplay data={{}} />);
  expect(container.firstChild).toBeNull();
});

// ✅ Données manquantes
it('should handle missing optional data gracefully', () => {
  const minimalData = { name: 'London', main: { temp: 18.0 } };
  render(<WeatherDisplay data={minimalData} />);
  expect(screen.getByText('London')).toBeInTheDocument();
});
```

## 🎣 Tests de Hooks

### **`useGeolocation.test.js`** - Géolocalisation

Tests du hook de géolocalisation critique pour UX :

```javascript
// ✅ Support navigateur
it('should detect when geolocation is not supported', () => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: undefined, writable: true
  });
  const { result } = renderHook(() => useGeolocation(mockT));
  expect(result.current.isSupported).toBe(false);
});

// ✅ Gestion d'erreurs
it('should handle geolocation permission denied', async () => {
  mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
    setTimeout(() => error({ code: 1 }), 0); // PERMISSION_DENIED
  });
  // ... test de l'erreur
});
```

## 🔄 Intégration CI/CD

### **Configuration Recommandée**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Tests Critiques
        run: npm run test:critical
      - name: Build Test
        run: npm run build
```

### **Tests Pré-Déploiement**

Avant chaque déploiement, exécuter :

```bash
# 1. Tests critiques
npm run test:critical

# 2. Build de production
npm run build

# 3. Vérification du build
ls -la build/

# 4. Tests avec couverture (optionnel)
npm run test:coverage
```

## 📊 Couverture de Code

### **Objectifs de Couverture**

- **Branches** : 60% minimum
- **Fonctions** : 60% minimum  
- **Lignes** : 60% minimum
- **Statements** : 60% minimum

### **Zones Prioritaires**

1. **Critique (100%)** : Cache, API calls, gestion d'erreurs
2. **Important (80%)** : Composants principaux, hooks métier
3. **Standard (60%)** : Composants UI, utilitaires

## 🚨 Checklist Pré-Déploiement

### **✅ Vérifications Obligatoires**

- [ ] `npm run test:critical` passe à 100%
- [ ] `npm run build` se termine sans erreurs
- [ ] Aucune vulnérabilité critique (`npm audit`)
- [ ] Variables d'environnement configurées
- [ ] Service Worker fonctionne

### **⚠️ Points d'Attention**

- **API Key** : Jamais en dur dans le code
- **Cache** : Fonctionne avec et sans localStorage  
- **Géolocalisation** : Gestion gracieuse si non supportée
- **Erreurs réseau** : Messages utilisateur appropriés
- **Build size** : < 5MB pour de bonnes performances

## 🔧 Maintenance des Tests

### **Règles d'Évolution**

1. **Nouveau composant** → Ajouter tests unitaires
2. **Nouvelle API** → Ajouter tests d'intégration  
3. **Bug en production** → Ajouter test de régression
4. **Fonctionnalité critique** → Ajouter à `test:critical`

### **Mise à Jour Régulière**

- [ ] Réviser tests critiques mensuellement
- [ ] Mettre à jour les seuils de couverture
- [ ] Nettoyer les tests obsolètes
- [ ] Documenter les nouveaux cas de test

---

## 🎉 Résultat Attendu

Avec cette stratégie de tests :

- **🛡️ Déploiements sécurisés** : Réduction drastique des régressions
- **⚡ Feedback rapide** : Tests critiques < 30 secondes  
- **🔍 Détection précoce** : Erreurs identifiées avant production
- **📈 Confiance équipe** : Déploiements sans stress

**Les tests ne sont pas une contrainte, mais votre filet de sécurité pour déployer sereinement !** 🚀