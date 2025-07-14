# 🏗️ Architecture WeatherGlass

## 📋 Vue d'ensemble

WeatherGlass utilise une **architecture Layout moderne** avec séparation claire des responsabilités entre logique métier et interface utilisateur.

## 🏛️ Structure des Composants

### **Architecture Générale**

```
App.js (Logique métier)
├── Layout (Structure globale)
│   ├── Header (Navigation et contrôles)
│   ├── MainContent (Contenu principal)
│   └── Footer (Pied de page)
└── Hooks & Services (État et données)
```

### **Hiérarchie Détaillée**

```
src/
├── App.js                    # Point d'entrée - Logique métier pure
├── layouts/                  # Composants de structure
│   ├── Layout.js            # Wrapper principal avec backgrounds
│   ├── Header.js            # Barre de navigation et contrôles
│   ├── MainContent.js       # Zone de contenu avec recherche
│   └── index.js             # Exports centralisés
├── components/              # Composants UI métier
│   ├── WeatherDisplay.js    # Affichage données météo
│   ├── SearchInput.js       # Recherche de ville
│   ├── WeeklyForecast.js    # Prévisions 7 jours
│   └── ...                  # Autres composants
├── hooks/                   # Logique métier réutilisable
│   ├── useTheme.js         # Gestion thème clair/sombre
│   ├── useGeolocation.js   # API géolocalisation
│   └── ...                 # Autres hooks
└── utils/                   # Utilitaires
    ├── weatherCache.js     # Cache intelligent météo
    └── ...                 # Autres utilitaires
```

## 🎯 Principes Architecturaux

### **1. Séparation des Responsabilités**

- **`App.js`** : Logique métier, gestion d'état, appels API
- **`Layout`** : Structure visuelle, positionnement, backgrounds  
- **`Components`** : Fonctionnalités UI spécifiques
- **`Hooks`** : Logique réutilisable et effets de bord

### **2. Flux de Données Unidirectionnel**

```
App.js (État global)
  ↓ Props
Layout (Structure)
  ↓ Props  
MainContent (Contenu)
  ↓ Props
Components (UI)
```

### **3. Composition over Inheritance**

- Utilisation de la **composition React** pour l'architecture
- **Props drilling contrôlé** avec interfaces claires
- **Hooks personnalisés** pour partager la logique

## 🔧 Composants Layout

### **`Layout.js` - Wrapper Principal**

**Responsabilités :**
- Structure HTML sémantique (`<header>`, `<main>`, `<footer>`)
- Gestion des backgrounds dynamiques
- Indicateurs PWA (offline, install, thème)
- Orchestration des composants globaux

**Props Interface :**
```javascript
{
  theme: 'light' | 'dark',
  themeMode: 'auto' | 'light' | 'dark', 
  onThemeToggle: () => void,
  currentBackground: string,
  autoRefresh: () => void,
  showAutoRefresh: boolean,
  children: ReactNode
}
```

### **`Header.js` - Navigation Globale**

**Responsabilités :**
- Contrôles de langue et thème
- Indicateur d'auto-refresh
- Navigation future (si routing ajouté)

**Props Interface :**
```javascript
{
  themeMode: string,
  theme: string, 
  onThemeToggle: () => void,
  autoRefresh: () => void,
  showAutoRefresh: boolean
}
```

### **`MainContent.js` - Zone de Contenu**

**Responsabilités :**
- Intégration recherche météo
- Affichage conditionnel (loading/content)
- Orchestration des composants météo

**Props Interface :**
```javascript
{
  // Search state
  location: string,
  setLocation: (string) => void,
  onSearchKeyPress: (event) => void,
  searchLoading: boolean,
  searchError: string,
  
  // Geolocation
  onLocationClick: () => void,
  locationLoading: boolean,
  isLocationSupported: boolean,
  
  // Weather data
  weatherData: object,
  forecastData: array,
  loading: boolean
}
```

## 🔄 Gestion d'État

### **État Centralisé dans App.js**

```javascript
// État principal
const [data, setData] = useState({});
const [forecastData, setForecastData] = useState([]);
const [location, setLocation] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// Hooks d'état spécialisés
const { themeMode, theme, toggleTheme } = useTheme();
const { t, language } = useTranslation();
const { location: geoLocation, getCurrentLocation } = useGeolocation(t);
```

### **Cache Intelligent**

```javascript
const cache = useRef(new WeatherCache());

// Cache avec TTL et éviction LRU
cache.current.set(cityName, weatherData);
const cachedData = cache.current.get(cityName);
```

## 📱 Responsive & PWA

### **Structure Responsive**

```css
.app {
  /* Layout global mobile-first */
}

.app-header {
  /* Header fixe responsive */
}

.main-content {
  /* Zone de contenu flexible */
}

.container {
  /* Conteneur principal centré */
}
```

### **Fonctionnalités PWA Intégrées**

- **Service Worker** avec cache stratégies
- **Manifest** avec shortcuts et icônes
- **Background Sync** pour les actions offline
- **Install Prompt** avec gestion d'état
- **Offline Indicator** en temps réel

## 🧪 Architecture de Tests

### **Tests par Couche**

```
__tests__/
├── critical.test.js         # Tests de sécurité déploiement  
├── App.integration.test.js  # Tests d'intégration
├── layouts/
│   ├── Layout.test.js      # Test du wrapper principal
│   ├── Header.test.js      # Test navigation
│   └── MainContent.test.js # Test zone contenu
├── components/
│   └── *.test.js          # Tests composants métier
├── hooks/
│   └── *.test.js          # Tests logique métier
└── utils/
    └── *.test.js          # Tests utilitaires
```

### **Stratégie de Mock**

- **Composants lourds** : Mocks pour performances
- **APIs externes** : Mocks avec axios
- **Hooks** : Mocks pour isolation
- **LocalStorage/Geolocation** : Mocks navigateur

## 🚀 Avantages de cette Architecture

### **✅ Maintenabilité**

- **Séparation claire** : UI vs logique métier
- **Composants focalisés** : Une responsabilité par composant  
- **Tests ciblés** : Test de chaque couche isolément
- **Évolutivité** : Ajout facile de nouvelles fonctionnalités

### **✅ Performance**

- **Composition efficace** : Pas de re-renders inutiles
- **Cache intelligent** : Réduction des appels API
- **Code splitting** prêt : Structure modulaire
- **Bundle optimisé** : Imports explicites

### **✅ Expérience Développeur**

- **Props typées** : Interfaces claires
- **Hot reload** : Développement rapide  
- **Debug facile** : État centralisé
- **Tests isolés** : Feedback rapide

### **✅ Robustesse**

- **Error boundaries** prêts : Structure en couches
- **Fallbacks** : Gestion gracieuse des erreurs
- **Cache resilient** : Fonctionnement offline
- **Tests de régression** : Protection déploiements

## 🔮 Évolutions Futures

### **Routing (Optionnel)**

Si besoin d'ajouter des routes :

```javascript
// App.js devient un Router
<Router>
  <Layout>
    <Routes>
      <Route path="/" element={<WeatherPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </Layout>
</Router>
```

### **State Management Global**

Pour une app plus complexe :

```javascript
// Context API ou Redux
<WeatherProvider>
  <Layout>
    <MainContent />
  </Layout>
</WeatherProvider>
```

### **Micro-Frontends**

Structure prête pour découpage :

```javascript
// Chaque section peut devenir indépendante
<Layout>
  <WeatherMicroApp />
  <ForecastMicroApp />
  <SettingsMicroApp />
</Layout>
```

---

## 📊 Métriques Architecture

- **Lignes de code par fichier** : < 300 lignes
- **Profondeur d'imbrication** : < 4 niveaux
- **Dépendances cycliques** : 0
- **Couverture tests** : > 60%
- **Performance Lighthouse** : Score > 90

Cette architecture garantit une **base solide** pour le développement continu de WeatherGlass ! 🌟