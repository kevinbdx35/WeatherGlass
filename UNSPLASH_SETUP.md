# Configuration Unsplash API

## 🖼️ Background Dynamique selon la Météo

Cette application utilise l'API Unsplash pour afficher des images de fond qui changent selon les conditions météorologiques actuelles.

## 📝 Obtenir une clé API Unsplash

### 1. Créer un compte développeur
1. Aller sur [Unsplash Developers](https://unsplash.com/developers)
2. Cliquer sur "Register as a developer"
3. Se connecter ou créer un compte Unsplash

### 2. Créer une nouvelle application
1. Une fois connecté, aller sur [Applications](https://unsplash.com/oauth/applications)
2. Cliquer sur "New Application"
3. Accepter les termes et conditions
4. Remplir les informations :
   - **Application name**: Weather React App
   - **Description**: Weather application with dynamic backgrounds
   - **Website**: http://localhost:3000 (en développement)

### 3. Récupérer la clé API
1. Une fois l'application créée, vous obtiendrez un **Access Key**
2. Copier cette clé (commence par quelque chose comme `xxx-xxxxxxxxxxxxxxxxx`)

## ⚙️ Configuration dans l'application

### 1. Créer le fichier .env
Dans le dossier `client/`, créer un fichier `.env` :

```bash
cd client
cp .env.example .env
```

### 2. Ajouter votre clé API
Ouvrir le fichier `.env` et remplacer :

```env
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

Par votre vraie clé :

```env
REACT_APP_UNSPLASH_ACCESS_KEY=xxx-xxxxxxxxxxxxxxxxx
```

### 3. Redémarrer l'application
```bash
npm start
```

## 🎨 Fonctionnalités

- **Images selon météo** : Soleil, nuages, pluie, neige, etc.
- **Cache intelligent** : Les images sont mises en cache 1 heure
- **Transitions fluides** : Animation de 0.8s entre les changements
- **Images de fallback** : Si l'API est indisponible
- **Attribution** : Crédit automatique aux photographes

## 📊 Limites API

- **Gratuit** : 50 requêtes/heure
- **Demo tier** : 50 téléchargements/mois
- **Production** : Demander une augmentation si nécessaire

## 🔧 Sans clé API

L'application fonctionne même sans clé API Unsplash :
- Utilise des images de fallback de haute qualité
- Aucune fonctionnalité cassée
- Message d'information dans la console

## 🚀 Images utilisées

### Conditions météo supportées :
- ☀️ **Clear** : Ciel clair, soleil
- ☁️ **Clouds** : Nuageux, couvert  
- 🌧️ **Rain** : Pluie, orage
- ❄️ **Snow** : Neige, hiver
- 🌫️ **Mist/Fog** : Brouillard, brume
- ⛈️ **Thunderstorm** : Orage, éclairs

Chaque condition recherche des images spécifiques avec des mots-clés optimisés pour obtenir les meilleurs résultats visuels.