# Guide de Déploiement - WeatherGlass

## Déploiement Automatique GitHub Pages

### Configuration Initiale

1. **Activer GitHub Pages** dans les paramètres du repository :
   - Aller dans `Settings` > `Pages`
   - Source: `GitHub Actions`
   - Les workflows se déclencheront automatiquement

2. **Variables d'environnement** (optionnel) :
   - Aller dans `Settings` > `Secrets and variables` > `Actions`
   - Ajouter si nécessaire :
     - `REACT_APP_OPENWEATHER_API_KEY`
     - `REACT_APP_UNSPLASH_ACCESS_KEY`

### Workflow Automatique

Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement :
- ✅ Sur chaque `push` vers la branche `main`
- ✅ Sur chaque `pull request` vers `main`

### Étapes du Déploiement

1. **Checkout** du code source
2. **Setup Node.js** 18 avec cache npm
3. **Installation** des dépendances (`npm ci`)
4. **Build** de l'application React
5. **Upload** vers GitHub Pages
6. **Déploiement** automatique

### URLs de Déploiement

- **Production** : https://kevinbdx35.github.io/WeatherGlass
- **Statut des deployments** : Onglet `Actions` du repository

### Vérifications Pré-Déploiement

Avant chaque commit, vérifier :

```bash
# Test local du build
cd client
npm run build

# Vérifier que le build fonctionne
npx serve -s build -p 3000
```

### Dépannage

**Problème** : Build qui échoue
- Vérifier les logs dans l'onglet `Actions`
- S'assurer que toutes les dépendances sont dans `package.json`

**Problème** : Page blanche après déploiement
- Vérifier que `homepage` est bien défini dans `package.json`
- Contrôler les chemins relatifs dans l'application

**Problème** : Variables d'environnement manquantes
- Vérifier que les secrets sont bien configurés
- S'assurer qu'ils commencent par `REACT_APP_`

### Monitoring

- **Build time** : ~2-3 minutes en moyenne
- **Monitoring** : GitHub Actions fournit les logs détaillés
- **Rollback** : Possible via les précédents deployments

### Notes de Sécurité

- ⚠️ **Jamais** committer de clés API directement dans le code
- ✅ Utiliser les variables d'environnement
- ✅ Les secrets GitHub sont chiffrés et sécurisés