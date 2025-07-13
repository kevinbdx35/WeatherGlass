
# Application Météo Progressive Web App

Une application météo moderne avec design glassmorphisme, support bilingue (FR/EN) et fonctionnalités PWA complètes.

## ✨ Fonctionnalités

- 🌤️ **Données météo en temps réel** via l'API OpenWeatherMap
- 🌍 **Support bilingue** français/anglais
- 📍 **Géolocalisation automatique** pour la météo locale
- 🎨 **Design glassmorphisme** avec thèmes clair/sombre
- 🖼️ **Arrière-plans dynamiques** adaptés à la météo (Unsplash)
- 📱 **Progressive Web App** installable et utilisable hors ligne
- ⚡ **Cache intelligent** pour les performances optimales
- 🎭 **Animations fluides** et interface responsive

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

## 🚀 Installation et Utilisation

### Prérequis
- Node.js (version 14+)
- Yarn ou NPM
- Clé API OpenWeatherMap

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/kevinbdx35/weather-react-node-app.git
cd weather-react-node-app
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

## 🌟 Fonctionnalités Avancées

### Gestion des Thèmes
- Thème automatique selon les préférences système
- Basculement manuel clair/sombre
- Variables CSS pour la cohérence visuelle

### Internationalisation
- Traductions complètes FR/EN
- Détection automatique de la langue navigateur
- Persistance des préférences utilisateur

### Performance
- Cache intelligent avec expiration
- Debouncing des recherches
- Optimisations React (memo, callbacks)
- Compression et minification

### Accessibilité
- Support clavier complet
- Labels ARIA appropriés
- Contraste élevé disponible
- Responsive design mobile-first

## 📊 Structure du Projet

```
weather-react-node-app/
├── client/                     # Application React
│   ├── public/
│   │   ├── manifest.json      # Configuration PWA
│   │   ├── sw.js             # Service Worker
│   │   └── offline.html      # Page hors ligne
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── locales/         # Fichiers de traduction
│   │   └── utils/           # Utilitaires
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

- [ ] Prévisions météo sur 7 jours
- [ ] Graphiques des tendances météo
- [ ] Notifications push pour les alertes météo
- [ ] Widget personnalisable
- [ ] Mode sombre automatique selon l'heure
- [ ] Support de plus de langues
- [ ] Intégration avec d'autres sources météo

## 📞 Support

Pour toute question ou assistance :
- Créer une issue GitHub
- Consulter la documentation
- Vérifier les issues existantes

