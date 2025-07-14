
# WeatherGlass ⚡

<div align="center">

![WeatherGlass Logo](./client/public/logo192.png)

**Une application météo progressive moderne avec design glassmorphisme élégant**

[![Déploiement](https://github.com/kevinbdx35/WeatherGlass/actions/workflows/deploy.yml/badge.svg)](https://github.com/kevinbdx35/WeatherGlass/actions/workflows/deploy.yml)
[![Demo Live](https://img.shields.io/badge/Demo-Live-success?style=flat&logo=github)](https://kevinbdx35.github.io/WeatherGlass)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.1.0-brightgreen.svg)]()

[🌐 **Demo Live**](https://kevinbdx35.github.io/WeatherGlass) | [📖 **Documentation**](#documentation) | [🚀 **Installation**](#installation)

</div>

---

**WeatherGlass** est une Progressive Web App météorologique moderne qui allie design glassmorphisme sophistiqué, prévisions sur 7 jours, support bilingue (FR/EN) et fonctionnalités PWA complètes.

## ✨ Fonctionnalités

- 🌤️ **Données météo multi-sources** avec agrégation intelligente et fallback automatique
- 📅 **Prévisions sur 7 jours** avec températures min/max et conditions détaillées
- 📊 **Graphiques de tendances météo** avec Chart.js (température, humidité, vent)
- 🔄 **Mise à jour automatique** toutes les 20 minutes avec indicateur visuel
- 🌍 **Support bilingue** français/anglais avec traductions complètes
- 📍 **Géolocalisation automatique** pour la météo locale
- 🎨 **Design glassmorphisme** avec thèmes clair/sombre adaptatifs
- 🌅 **Mode sombre automatique** selon l'heure (19h-7h sombre, 7h-19h clair)
- 🖼️ **Arrière-plans dynamiques** adaptés à la météo (Unsplash)
- 📱 **Progressive Web App** installable avec icônes personnalisées
- ⚡ **Cache intelligent** et système de fallback multi-sources pour 99.9% de disponibilité
- 🚨 **Alertes officielles** Météo France pour les utilisateurs français
- 🔄 **Basculement automatique** entre sources météo en cas de panne
- 🎭 **Animations fluides** et interface responsive
- 📊 **Métriques détaillées** (humidité, vent, pression, visibilité)
- ✕ **Prompt PWA dismissible** avec mémorisation des préférences

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
- React 18 avec hooks personnalisés avancés
- Chart.js 4.5.0 pour les graphiques de tendances
- CSS3 avec variables et glassmorphisme
- Service Worker pour le cache offline
- Manifest PWA complet avec icônes personnalisées

**Backend:**
- Node.js & Express
- Agrégateur multi-sources météo intelligent
- API Unsplash pour les images

**APIs météo (toutes gratuites):**
- Open-Meteo (source principale, 10k appels/jour, données ECMWF)
- WeatherAPI (backup, 1M appels/mois, couverture mondiale)
- Météo France (alertes officielles, 500 appels/jour, France + DOM-TOM)
- OpenWeatherMap (fallback legacy, service existant)
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
- Clés API gratuites (optionnelles) :
  - WeatherAPI (1M appels/mois gratuits)
  - Météo France (500 appels/jour gratuits)
  - OpenWeatherMap (service legacy existant)

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

## 🆕 Nouveautés v2.1.0

### 🎛️ **Layout Tableau de Bord Pro**
- **Interface tableau de bord** : Layout professionnel sans scroll
- **Viewport 100vh** : Tout le contenu visible en une seule vue
- **Grid optimisé** : Proportions parfaites (40vh météo, 25vh prévisions, 25vh données)
- **Réorganisation intelligente** : Données météo empilées à droite, prévisions centrales
- **Zéro scroll** : Expérience immersive complète sur desktop

### 🎨 **Refonte UI/UX Majeure**
- **Interface modernisée** : Design épuré et professionnel
- **Glassmorphisme optimisé** : Effets visuels plus subtils et élégants
- **Typographie améliorée** : Hiérarchie visuelle claire avec polices optimisées
- **Micro-interactions fluides** : Animations de 0.2s pour une réactivité optimale
- **Palette de couleurs harmonisée** : Contraste et lisibilité améliorés

### 📱 **Ergonomie Mobile Optimisée**
- **Touch targets étendus** : 44px minimum pour une navigation tactile confortable
- **Layout responsive revu** : Adaptation parfaite aux écrans mobiles
- **Interface de recherche modernisée** : Input avec bouton clear et focus states
- **Navigation intuitive** : Feedback visuel immédiat sur toutes les interactions

### ⚡ **Expérience Utilisateur Améliorée**
- **États de focus visuels** : Accessibilité keyboard améliorée
- **Loading states subtils** : Indicateurs visuels non-intrusifs
- **Transitions fluides** : Animations réduites pour plus de réactivité
- **Feedback interactif** : Clear button, hover states, progress indicators

### 🛡️ **Robustesse & Sécurité**
- **Tests de sécurité critiques** : 12 tests de safety pour prévenir les crashes
- **Gestion d'erreurs bulletproof** : Protection contre tous types d'erreurs JS
- **Validation de types stricte** : Prévention des erreurs de runtime
- **Build automatique sécurisé** : Tests de safety avant chaque build

### ♿ **Accessibilité Renforcée**
- **Focus visible** : Contours clairs pour navigation clavier
- **Reduced motion** : Respect des préférences utilisateur
- **Contraste optimisé** : Meilleure lisibilité en mode clair/sombre
- **ARIA labels** : Support lecteurs d'écran amélioré

## 🆕 Nouveautés v2.0.0

### 🌍 **Système Multi-Sources Météo**
- **4 sources météo gratuites** : Open-Meteo, WeatherAPI, Météo France, OpenWeatherMap
- **Agrégation intelligente** avec stratégies fallback et consensus
- **99.9% de disponibilité** grâce au basculement automatique
- **Coût zéro** : uniquement des APIs gratuites avec quotas généreux
- **Monitoring d'usage** : statistiques détaillées par source
- **Cache optimisé** : quotas préservés avec mise en cache intelligente

### 🚨 **Alertes Météo Officielles**
- **Intégration Météo France** pour les alertes gouvernementales
- **Niveaux d'alerte** : Vert, Jaune, Orange, Rouge avec codes couleur
- **Détection automatique** pour les utilisateurs en France
- **Vigilance météorologique** officielle en temps réel

### 🏗️ **Architecture Moderne**
- **Layout system** avec séparation des préoccupations
- **Services modulaires** pour chaque source météo
- **Tests complets** : 75+ tests pour fiabilité maximale
- **Gestion d'erreurs robuste** avec messages contextuels
- **Footer sticky** corrigé avec CSS flexbox

### 🧪 **Tests et Fiabilité**
- **75+ tests unitaires** et d'intégration passants
- **Coverage critique** pour éviter les régressions de déploiement
- **Tests de fallback** pour chaque source météo
- **Mocking avancé** d'axios et des services externes
- **Tests d'agrégation** et de consensus

## 🆕 Nouveautés v1.2.0

### 🌅 **Mode Sombre Automatique**
- **Changement automatique** selon l'heure du jour
- **Horaires optimisés** : mode sombre 19h-7h, clair 7h-19h
- **3 modes disponibles** : Auto (par défaut), Clair, Sombre
- **Indicateur visuel** en temps réel avec icône 🌙/☀️
- **Vérification continue** : transition automatique toutes les minutes

## 🆕 Nouveautés v1.1.0

### 📊 **Graphiques de Tendances Météo**
- **Chart.js intégré** avec 3 types de visualisations
- **Température** : graphique en aires avec min/max
- **Humidité** : graphique en barres colorées
- **Vent** : graphique linéaire avec vitesse
- **Contrôles interactifs** pour basculer entre les vues

### 🔄 **Mise à Jour Automatique**
- **Actualisation automatique** toutes les 20 minutes
- **Indicateur visuel** 🔄 avec animation de pulsation
- **Clic pour actualiser** manuellement
- **Pause intelligente** quand l'onglet n'est pas visible
- **Reprise automatique** au retour sur l'onglet

### 🌐 **Changement de Langue Amélioré**
- **Bug React.memo corrigé** - changement instantané FR/EN
- **Toutes les traductions** mises à jour immédiatement
- **Composants non-memo** pour éviter les blocages de re-rendu

### 📱 **PWA Optimisée**
- **Icônes personnalisées WeatherGlass** (192px, 512px, Apple 180px)
- **Design glassmorphisme** cohérent sur toutes les plateformes
- **Prompt d'installation amélioré** avec bouton de refus
- **Mémorisation des préférences** - ne se réaffiche plus après refus

### 📍 **Positionnement Mobile Amélioré**
- **Crédit Unsplash repositionné** en haut à gauche sur mobile
- **Évite la superposition** avec les graphiques
- **Meilleure lisibilité** sur tous les écrans

## 🌍 **Demo en Ligne**

🔗 **URL de Production** : [https://kevinbdx35.github.io/WeatherGlass](https://kevinbdx35.github.io/WeatherGlass)

### **Fonctionnalités Testables :**
- ✅ **Sources météo multiples** avec fallback automatique
- ✅ **Alertes Météo France** pour les villes françaises
- ✅ Recherche de villes par nom
- ✅ Géolocalisation automatique  
- ✅ Basculement thème clair/sombre
- ✅ Changement de langue FR/EN instantané
- ✅ Installation PWA avec icônes personnalisées WeatherGlass
- ✅ Mode hors ligne (coupez votre connexion)
- ✅ Prévisions sur 7 jours avec animations
- ✅ Graphiques de tendances météo interactifs
- ✅ Mise à jour automatique avec indicateur 🔄
- ✅ Prompt PWA dismissible (avec croix et "Plus tard")
- ✅ Mode sombre automatique selon l'heure (19h-7h)
- ✅ **99.9% disponibilité** même si certaines sources tombent

## 🌟 Fonctionnalités Avancées

### Système Multi-Sources Météo Intelligent
- **Agrégation avancée** : stratégies fallback, consensus et spécialisée
- **Sources complémentaires** : Open-Meteo (ECMWF), WeatherAPI (global), Météo France (officiel)
- **Quotas optimisés** : 10k+ appels/jour combinés, cache intelligent par source
- **Monitoring temps réel** : statistiques d'usage et santé des services
- **Gestion des pannes** : basculement automatique en millisecondes
- **Alertes contextuelles** : intégration automatique des vigilances météo France
- **Consensus de données** : combinaison de plusieurs sources pour plus de précision

### Prévisions Météo et Graphiques
- **Données 7 jours** avec températures min/max quotidiennes
- **Graphiques de tendances** : température (min/max), humidité, vitesse du vent
- **Chart.js interactif** avec 3 types de visualisations (ligne, aire, barres)
- **Conditions détaillées** : humidité, vent, pression, visibilité
- **Interface responsive** : grille adaptative sur tous écrans
- **Animations fluides** : apparition séquentielle des cartes
- **Cache intelligent** : prévisions mises en cache pour performance

### Gestion des Thèmes Intelligente
- **Mode automatique** selon l'heure : sombre 19h-7h, clair 7h-19h
- **3 modes disponibles** : Auto, Clair, Sombre (cycle avec le bouton)
- **Indicateur visuel** en mode automatique avec icône jour/nuit
- **Vérification temps réel** : changement automatique toutes les minutes
- **Basculement manuel** possible à tout moment
- **Variables CSS** pour la cohérence visuelle
- **Adaptations glassmorphisme** selon le thème

### Internationalisation et UX
- **Traductions complètes** FR/EN (météo, interface, prévisions, graphiques)
- **Changement de langue instantané** (bug React.memo corrigé)
- **Détection automatique** de la langue navigateur
- **Formatage des dates** selon la locale
- **Persistance des préférences** utilisateur
- **Mise à jour automatique** toutes les 20 minutes avec indicateur visuel
- **Installation PWA optimisée** avec possibilité de refus mémorisé

### Performance et Fiabilité
- **Cache multi-niveaux** avec expiration différenciée par source
- **Debouncing intelligent** des recherches et requêtes
- **Appels API parallèles** optimisés avec Promise.allSettled
- **Optimisations React** avancées (memo, callbacks, lazy loading)
- **Compression et minification** avec tree shaking
- **Tests de charge** : 75+ tests couvrant tous les cas d'erreur
- **Tests de sécurité** : 12 tests critiques pour prévenir les crashes
- **Monitoring proactif** : détection automatique des pannes de service
- **Récupération d'erreur** : retry automatique avec backoff exponentiel
- **UI/UX moderne** : Interface refaite avec micro-interactions fluides

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
│   │   │   ├── WeatherChart.js      # Graphiques tendances météo
│   │   │   ├── SearchInput.js       # Recherche de ville
│   │   │   ├── ThemeToggle.js       # Basculeur de thème
│   │   │   ├── LanguageToggle.js    # Sélecteur de langue
│   │   │   ├── InstallPrompt.js     # Prompt d'installation PWA
│   │   │   ├── DynamicBackground.js # Arrière-plans dynamiques
│   │   │   ├── AutoThemeIndicator.js # Indicateur mode automatique
│   │   │   ├── Footer.js            # Footer avec attribution Unsplash
│   │   │   └── OfflineIndicator.js  # Indicateur hors ligne
│   │   ├── layouts/         # Système de layout moderne
│   │   │   ├── Layout.js            # Layout principal wrapper
│   │   │   ├── Header.js            # En-tête avec contrôles
│   │   │   ├── MainContent.js       # Zone de contenu principal
│   │   │   └── __tests__/           # Tests du layout system
│   │   ├── services/        # Services météo modulaires
│   │   │   ├── openMeteoService.js  # Service Open-Meteo (principal)
│   │   │   ├── weatherAPIService.js # Service WeatherAPI (backup)
│   │   │   ├── meteoFranceService.js # Service Météo France (alertes)
│   │   │   ├── weatherAggregator.js # Agrégateur intelligent
│   │   │   └── __tests__/           # Tests des services (65+ tests)
│   │   ├── hooks/           # Hooks personnalisés
│   │   │   ├── useTranslation.js    # Gestion i18n
│   │   │   ├── useTheme.js          # Gestion des thèmes
│   │   │   ├── useGeolocation.js    # Géolocalisation
│   │   │   ├── usePWA.js            # Fonctionnalités PWA
│   │   │   ├── useAutoRefresh.js    # Mise à jour automatique
│   │   │   └── useWeatherBackground.js # Arrière-plans dynamiques
│   │   ├── locales/         # Fichiers de traduction
│   │   │   ├── fr.json              # Traductions françaises
│   │   │   └── en.json              # Traductions anglaises
│   │   └── utils/           # Utilitaires
│   │       ├── weatherCache.js      # Système de cache
│   │       └── themeTestHelper.js   # Utilitaires test thème auto
├── server/                   # Backend Node.js
└── README.md
```

## 🔧 Configuration

### Variables d'environnement
Créer un fichier `.env.local` dans le dossier `client/` avec :
```env
# Open-Meteo (AUCUNE CLÉ REQUISE - 10k appels/jour gratuits)
# Pas de configuration nécessaire

# WeatherAPI (optionnel - 1M appels/mois gratuits)
REACT_APP_WEATHERAPI_KEY=votre_clé_weatherapi_gratuite

# Météo France (optionnel - 500 appels/jour gratuits + alertes)
REACT_APP_METEOFRANCE_KEY=votre_clé_meteofrance_gratuite

# OpenWeatherMap (legacy fallback)
REACT_APP_OPENWEATHER_API_KEY=votre_clé_openweathermap

# Port serveur (optionnel)
PORT=3001
```

**Note importante :** L'application fonctionne parfaitement avec Open-Meteo seul (aucune clé requise). Les autres clés sont optionnelles et ajoutent de la redondance.

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
- [x] **Graphiques des tendances météo avec Chart.js** ✅ *Implémenté*
- [x] **Mise à jour automatique des données** ✅ *Implémenté*
- [x] **Correction changement de langue instantané** ✅ *Implémenté*
- [x] **Icônes PWA personnalisées WeatherGlass** ✅ *Implémenté*
- [x] **Prompt PWA avec option de refus** ✅ *Implémenté*
- [x] **Mode sombre automatique selon l'heure** ✅ *Implémenté*
- [x] **Footer dédié pour attribution Unsplash** ✅ *Implémenté*
- [x] **Système multi-sources météo intelligent** ✅ *Implémenté v2.0.0*
- [x] **Agrégation avec fallback automatique** ✅ *Implémenté v2.0.0*
- [x] **Alertes officielles Météo France** ✅ *Implémenté v2.0.0*
- [x] **Architecture moderne avec tests** ✅ *Implémenté v2.0.0*
- [x] **75+ tests unitaires et d'intégration** ✅ *Implémenté v2.0.0*
- [x] **Refonte UI/UX moderne et accessible** ✅ *Implémenté v2.1.0*
- [x] **12 tests de sécurité critiques** ✅ *Implémenté v2.1.0*
- [x] **Layout tableau de bord professionnel** ✅ *Implémenté v2.1.0*
- [x] **Interface 100vh sans scroll sur desktop** ✅ *Implémenté v2.1.0*
- [ ] Notifications push pour les alertes météo
- [ ] Widget personnalisable pour l'écran d'accueil
- [ ] Support de plus de langues (ES, DE, IT)
- [ ] Stratégie consensus avancée pour plus de précision
- [ ] Radar météo interactif
- [ ] Historique des données météo
- [ ] Dashboard de monitoring des sources
- [ ] API publique pour développeurs tiers

## 📞 Support

Pour toute question ou assistance :
- Créer une issue GitHub
- Consulter la documentation
- Vérifier les issues existantes

