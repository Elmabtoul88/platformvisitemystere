# Progressive Web App (PWA) - Emberton Group

Ce dossier contient l'ensemble des fichiers de configuration et des ressources nécessaires au fonctionnement en mode **Progressive Web App (PWA)** de l'application Emberton Group.

---

## 📁 Structure du dossier PWA

| Fichier | Rôle |
|---|---|
| `manifest.json` | Manifeste Web App (Nom, icônes, couleurs de thème `#041F40`, orientation) |
| `sw.js` | Service Worker (Stratégie de cache Stale-While-Revalidate + Network-First pour les API) |
| `offline.html` | Page d'accueil hors-ligne avec message de réassurance sur la conservation des brouillons |
| `icons/` | Icônes haute résolution vectorielles (192x192, 512x512 et maskable) |

---

## 📲 Expérience Utilisateur & Installation

### Sur iOS (iPhone / iPad - Safari) :
1. Ouvrir l'application dans Safari.
2. Cliquer sur l'icône de partage (carré avec flèche vers le haut).
3. Sélectionner **« Sur l'écran d'accueil »**.
4. L'icône Emberton s'ajoute sur l'écran d'accueil et s'ouvre en **plein écran natif** (sans barre d'adresse Safari).

### Sur Android (Chrome / Edge / Samsung Internet) :
1. Une bannière ou invite d'installation automatique apparaît : **« Installer l'application Emberton »**.
2. Ou via le menu 3 points -> **« Installer l'application »**.

---

## 🚀 Déploiement sur cPanel

1. Les fichiers de ce dossier sont également répliqués dans le dossier `public/` de l'application Next.js.
2. Lors du build (`npm run build`), ils sont servis directement à la racine :
   - `https://votredomaine.com/manifest.json`
   - `https://votredomaine.com/sw.js`
   - `https://votredomaine.com/offline.html`
   - `https://votredomaine.com/icons/...`
3. Le Service Worker est automatiquement enregistré au démarrage de l'application par le layout racine.
