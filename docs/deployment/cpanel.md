# Guide de Déploiement Complet sur cPanel (Sans Docker)

Ce guide décrit la procédure exacte pour déployer la plateforme **MissionView** sur un hébergement web **cPanel** classique en utilisant le gestionnaire **Node.js Selector (Phusion Passenger)** et une base de données **MySQL cPanel**.

---

## 🏗️ Architecture du Déploiement sur cPanel

L'application est déployée sous forme de deux services Node.js distincts ou d'un domaine avec sous-domaine :

| Service | Emplacement cPanel | URL | Fichier Startup |
| :--- | :--- | :--- | :--- |
| **Frontend Next.js** | `/home/user/frontend` (ou `public_html`) | `https://votre-domaine.com` | `server.js` |
| **Backend Express API** | `/home/user/api` (ou `/home/user/backend`) | `https://api.votre-domaine.com` (ou `/api`) | `app.js` |
| **Base de Données** | cPanel MySQL | `localhost:3306` | Base `user_missionview` |

---

## 📋 Prérequis sur votre hébergement cPanel

1. Accès à votre espace **cPanel**.
2. Outil **« Setup Node.js App »** disponible (CloudLinux Node.js Selector / Passenger).
3. Version de Node.js recommandée : **Node.js 18.x LTS** ou **20.x LTS**.
4. Un nom de domaine principal (ex: `votre-domaine.com`) et un sous-domaine pour l'API (ex: `api.votre-domaine.com`).

---

## 🗄️ Étape 1 : Création de la Base de Données MySQL

1. Dans cPanel, cliquez sur **Bases de données MySQL**.
2. Créez une nouvelle base (ex: `cpuser_missionview`).
3. Créez un utilisateur MySQL (ex: `cpuser_dbadmin`) avec un mot de passe sécurisé.
4. Associez l'utilisateur à la base en cochant **TOUS LES PRIVILÈGES** (`ALL PRIVILEGES`).
5. Ouvrez **phpMyAdmin** depuis cPanel :
   * Sélectionnez votre base `cpuser_missionview`.
   * Cliquez sur l'onglet **Importer**.
   * Importez votre fichier d'export SQL local (ou les tables générées par Prisma).

---

## ⚙️ Étape 2 : Déploiement du Backend (API Express)

### 1. Téléverser les fichiers de l'API
Téléversez le contenu du dossier `backend/` dans un dossier dédié sur le serveur (ex: `/home/cpuser/api`) :
* `app.js`
* `package.json`
* Dossier `routes/`
* Dossier `middleware/`
* Dossier `services/`
* Dossier `prisma/`
* Dossier `uploads/` (créer s'il n'existe pas)
* Dossier `documents/` (créer s'il n'existe pas)

### 2. Configurer le fichier `api/.env`
Dans le dossier `/home/cpuser/api/`, créez le fichier `.env` :
```env
DATABASE_URL="mysql://cpuser_dbadmin:VOTRE_MOT_DE_PASSE@localhost:3306/cpuser_missionview"
LOCALHOST=localhost
USER=cpuser_dbadmin
PASSWORD=VOTRE_MOT_DE_PASSE
DATABASE=cpuser_missionview

# Clé de signature JWT
PRIVATEKEY="votre_cle_secrete_longue_et_aleatoire"

# URL publique de l'API backend
BASE_URL="https://api.votre-domaine.com/api/"

# Configuration SMTP pour les emails automatiques
MAIL_MAILER=smtp
MAIL_HOST=mail.votre-domaine.com
MAIL_PORT=465
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=votre_mot_de_passe_email
ADMIN_EMAIL=contact@votre-domaine.com
```

### 3. Créer l'application Node.js dans cPanel
1. Allez dans **cPanel $\rightarrow$ Setup Node.js App**.
2. Cliquez sur **Create Application**.
3. Remplissez les champs :
   * **Node.js version** : `18.x` ou `20.x`.
   * **Application mode** : `Production`.
   * **Application root** : `api`.
   * **Application URL** : Sélectionnez votre sous-domaine `api.votre-domaine.com`.
   * **Application startup file** : `app.js`.
4. Cliquez sur **Create**.
5. Cliquez sur le bouton **Run NPM Install** pour installer les dépendances automatiquement.
6. Cliquez sur **Restart**.
7. Testez dans votre navigateur : `https://api.votre-domaine.com/api/stores/missions` doit retourner un code HTTP 200 avec vos magasins en JSON.

---

## 💻 Étape 3 : Déploiement du Frontend (Next.js)

### 1. Préparer le Build de Production en Local
Avant d'envoyer les fichiers sur cPanel, compilez le projet Next.js sur votre machine :
1. Dans le fichier `.env` à la racine :
   ```env
   NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api/
   ```
2. Lancez le build propre :
   ```bash
   npm run build
   ```
   *(Un dossier optimisé `.next/` est généré)*.

### 2. Téléverser les fichiers Frontend sur cPanel
Dans le répertoire de votre site (ex: `/home/cpuser/frontend` ou `/home/cpuser/public_html`), téléversez **uniquement** :
* Le dossier `.next/` (généré à l'étape précédente)
* Le dossier `public/`
* Le fichier `server.js` (point d'entrée cPanel Passenger)
* Le fichier `package.json`
* Le fichier `.env`

> [!IMPORTANT]
> Ne téléversez **pas** le dossier `node_modules` local (il sera installé directement sur cPanel) ni le dossier `.git`.

### 3. Créer l'application Frontend dans cPanel
1. Allez dans **cPanel $\rightarrow$ Setup Node.js App**.
2. Cliquez sur **Create Application**.
3. Remplissez les champs :
   * **Node.js version** : `18.x` ou `20.x` (identique au backend).
   * **Application mode** : `Production`.
   * **Application root** : `frontend` (ou `public_html`).
   * **Application URL** : Votre domaine principal `votre-domaine.com`.
   * **Application startup file** : `server.js`.
4. Cliquez sur **Create**.
5. Cliquez sur le bouton **Run NPM Install**.
6. Cliquez sur **Restart**.

---

## 🔒 Étape 4 : Permissions des Dossiers Médias

Dans le **Gestionnaire de fichiers cPanel** :
1. Naviguez vers le dossier de votre backend (`api/`).
2. Faites un clic droit sur le dossier `uploads/` $\rightarrow$ **Change Permissions** $\rightarrow$ Réglez sur **`755`**.
3. Faites un clic droit sur le dossier `documents/` $\rightarrow$ **Change Permissions** $\rightarrow$ Réglez sur **`755`**.

Ces permissions permettent aux mystery shoppers de téléverser des photos de visite, des justificatifs et des enregistrements audio sans blocage de sécurité serveur.

---

## 🚨 Dépannage & Astuces cPanel

### Erreur 503 Service Unavailable ou Application Not Responding
* Rendez-vous dans **Setup Node.js App** et vérifiez que l'application est bien en état **Running**.
* Consultez le fichier `stderr.log` dans le dossier de votre application pour identifier l'erreur exacte.

### Les images ou fichiers audio ne se chargent pas
* Vérifiez que l'URL dans `NEXT_PUBLIC_API_URL` commence bien par `https://` (avec certificat SSL actif).
* Vérifiez les permissions `755` sur les dossiers `uploads/` et `documents/`.

### Redémarrage après une modification
* Après toute modification de code ou de variable d'environnement, cliquez systématiquement sur le bouton **Restart** dans **Setup Node.js App** sur cPanel.
