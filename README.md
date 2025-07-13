
# WeatherGlass ⚡

<div align="center">

![WeatherGlass Logo](./client/public/favicon.ico)

**Une application météo progressive moderne avec design glassmorphisme élégant**

[![Déploiement](https://github.com/kevinbdx35/WeatherGlass/actions/workflows/deploy.yml/badge.svg)](https://github.com/kevinbdx35/WeatherGlass/actions/workflows/deploy.yml)
[![Demo Live](https://img.shields.io/badge/Demo-Live-success?style=flat&logo=github)](https://kevinbdx35.github.io/WeatherGlass)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)]()

[🌐 **Demo Live**](https://kevinbdx35.github.io/WeatherGlass) | [📖 **Documentation**](#documentation) | [🚀 **Installation**](#installation)

</div>

---

**WeatherGlass** est une Progressive Web App météorologique moderne qui allie design glassmorphisme sophistiqué, prévisions sur 7 jours, support bilingue (FR/EN) et fonctionnalités PWA complètes.

## ✨ Fonctionnalités

- 🌤️ **Données météo en temps réel** via l'API OpenWeatherMap
- 📅 **Prévisions sur 7 jours** avec températures min/max et conditions détaillées
- 🌍 **Support bilingue** français/anglais avec traductions complètes
- 📍 **Géolocalisation automatique** pour la météo locale
- 🎨 **Design glassmorphisme** avec thèmes clair/sombre adaptatifs
- 🖼️ **Arrière-plans dynamiques** adaptés à la météo (Unsplash)
- 📱 **Progressive Web App** installable et utilisable hors ligne
- ⚡ **Cache intelligent** pour les performances optimales
- 🎭 **Animations fluides** et interface responsive
- 📊 **Métriques détaillées** (humidité, vent, pression, visibilité)

## 🎥 **Aperçu**

<div align="center">

### 🖥️ **Interface Bureau**
![Demo Desktop](https://via.placeholder.com/800x500/1e293b/60a5fa?text=WeatherGlass+Desktop+Demo)

### 📱 **Interface Mobile**
<img src="https://via.placeholder.com/300x600/1e293b/60a5fa?text=WeatherGlass+Mobile" alt="Demo Mobile" width="300">

### 🌙 **Mode Sombre & Glassmorphisme**
![Glassmorphism Demo](https://via.placeholder.com/800x400/000000/ffffff?text=Glassmorphism+Design)

</div>

## 📱 Fonctionnalités PWA

- ✅ **Installation** sur mobile et desktop
- ✅ **Mode hors ligne** avec cache des données
- ✅ **Notifications push** (prêt pour les alertes météo)
- ✅ **Background sync** pour les actions différées
- ✅ **Interface native** avec splashscreen et icônes

## 🛠️ Technologies

**Frontend:**
- React 18 avec hooks personnalisés
- CSS3 avec variables et glassmorphisme
- Service Worker pour le cache offline
- Manifest PWA complet

**Backend:**
- Node.js & Express
- API OpenWeatherMap
- API Unsplash pour les images

**APIs externes:**
- OpenWeatherMap (données météo)
- Unsplash (arrière-plans dynamiques)
- Geolocation API (position utilisateur)

**Déploiement & DevOps:**
- GitHub Actions (CI/CD automatique)
- GitHub Pages (hébergement)
- Service Worker (cache et offline)

**Design & UX:**
- Glassmorphism (effets de verre)
- Responsive Design (mobile-first)
- Animations CSS fluides
- Thèmes adaptatifs (clair/sombre)

## 🚀 Installation et Utilisation

### Prérequis
- Node.js (version 14+)
- Yarn ou NPM
- Clé API OpenWeatherMap

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/kevinbdx35/WeatherGlass.git
cd WeatherGlass
```

2. **Configuration du serveur**
```bash
yarn install
```

3. **Configuration du client**
```bash
cd client
yarn install
```

### Développement

**Démarrer le client en mode développement:**
```bash
cd client
yarn start
```

**Démarrer le serveur:**
```bash
# Depuis la racine du projet
node index.js
```

### Production

**Build du client:**
```bash
cd client
yarn build
```

**Démarrer en production:**
```bash
# Depuis la racine
node index.js
```

L'application sera accessible sur `http://localhost:3000`

## 🌍 **Demo en Ligne**

🔗 **URL de Production** : [https://kevinbdx35.github.io/WeatherGlass](https://kevinbdx35.github.io/WeatherGlass)

### **Fonctionnalités Testables :**
- ✅ Recherche de villes par nom
- ✅ Géolocalisation automatique  
- ✅ Basculement thème clair/sombre
- ✅ Changement de langue FR/EN
- ✅ Installation PWA (bouton dans le navigateur)
- ✅ Mode hors ligne (coupez votre connexion)
- ✅ Prévisions sur 7 jours avec animations

## 🌟 Fonctionnalités Avancées

### Prévisions Météo
- **Données 7 jours** avec températures min/max quotidiennes
- **Conditions détaillées** : humidité, vent, pression
- **Interface responsive** : grille adaptative sur tous écrans
- **Animations fluides** : apparition séquentielle des cartes
- **Cache intelligent** : prévisions mises en cache pour performance

### Gestion des Thèmes
- Thème automatique selon les préférences système
- Basculement manuel clair/sombre
- Variables CSS pour la cohérence visuelle
- Adaptations glassmorphisme selon le thème

### Internationalisation
- Traductions complètes FR/EN (météo, interface, prévisions)
- Détection automatique de la langue navigateur
- Formatage des dates selon la locale
- Persistance des préférences utilisateur

### Performance
- Cache intelligent avec expiration (météo + prévisions)
- Debouncing des recherches
- Appels API parallèles (météo actuelle + prévisions)
- Optimisations React (memo, callbacks)
- Compression et minification

### Accessibilité
- Support clavier complet
- Labels ARIA appropriés
- Contraste élevé disponible
- Responsive design mobile-first

## 📊 Structure du Projet

```
WeatherGlass/
├── client/                     # Application React
│   ├── public/
│   │   ├── manifest.json      # Configuration PWA
│   │   ├── sw.js             # Service Worker
│   │   └── offline.html      # Page hors ligne
│   ├── src/
│   │   ├── components/       # Composants React
│   │   │   ├── WeatherDisplay.js    # Météo actuelle
│   │   │   ├── WeeklyForecast.js    # Prévisions 7 jours
│   │   │   ├── ForecastCard.js      # Carte prévision quotidienne
│   │   │   ├── SearchInput.js       # Recherche de ville
│   │   │   ├── ThemeToggle.js       # Basculeur de thème
│   │   │   ├── LanguageToggle.js    # Sélecteur de langue
│   │   │   ├── InstallPrompt.js     # Prompt d'installation PWA
│   │   │   └── OfflineIndicator.js  # Indicateur hors ligne
│   │   ├── hooks/           # Hooks personnalisés
│   │   │   ├── useTranslation.js    # Gestion i18n
│   │   │   ├── useTheme.js          # Gestion des thèmes
│   │   │   ├── useGeolocation.js    # Géolocalisation
│   │   │   ├── usePWA.js            # Fonctionnalités PWA
│   │   │   └── useWeatherBackground.js # Arrière-plans dynamiques
│   │   ├── locales/         # Fichiers de traduction
│   │   │   ├── fr.json              # Traductions françaises
│   │   │   └── en.json              # Traductions anglaises
│   │   └── utils/           # Utilitaires
│   │       └── weatherCache.js      # Système de cache
├── server/                   # Backend Node.js
└── README.md
```

## 🔧 Configuration

### Variables d'environnement
Créer un fichier `.env` à la racine avec :
```env
OPENWEATHER_API_KEY=votre_clé_api_openweathermap
PORT=3001
```

### Personnalisation
- Couleurs et thèmes dans `src/index.css`
- Traductions dans `src/locales/`
- Configuration PWA dans `public/manifest.json`


## 📝 Licence

[MIT](https://choosealicense.com/licenses/mit/)

## 👨‍💻 Auteur

- [@kevin b.](https://github.com/kevinbdx35)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 🐛 Signaler un Bug

Si vous trouvez un bug, merci de créer une issue avec :
- Description détaillée du problème
- Étapes pour reproduire
- Captures d'écran si applicable
- Informations sur votre environnement (OS, navigateur, etc.)

## 💡 Roadmap

- [x] **Prévisions météo sur 7 jours** ✅ *Implémenté*
- [ ] Graphiques des tendances météo avec Chart.js
- [ ] Notifications push pour les alertes météo
- [ ] Widget personnalisable pour l'écran d'accueil
- [ ] Mode sombre automatique selon l'heure
- [ ] Support de plus de langues (ES, DE, IT)
- [ ] Intégration avec d'autres sources météo
- [ ] Radar météo interactif
- [ ] Historique des données météo
- [ ] Alertes météo personnalisées

## 📞 Support

Pour toute question ou assistance :
- Créer une issue GitHub
- Consulter la documentation
- Vérifier les issues existantes

