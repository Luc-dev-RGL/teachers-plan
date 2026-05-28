# Teacher's Plan - Backend Complet v2.0

Backend complet pour l'application de gestion des emplois du temps et des heures d'enseignement.

## 📋 Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Initialisation de la base de données](#initialisation-de-la-base-de-données)
- [Démarrage](#démarrage)
- [API Reference](#api-reference)
- [Structure du projet](#structure-du-projet)

## ✨ Fonctionnalités

- **Authentification JWT** - Connexion sécurisée avec tokens
- **Gestion des enseignants** - CRUD complet avec transactions
- **Gestion des départements, filières, niveaux, classes**
- **Gestion des salles et matières**
- **Séances de cours** - Planification et suivi
- **Heures effectuées** - Calcul automatique avec coefficients
- **Tableau de bord** - Statistiques et indicateurs
- **Exports** - Excel et PDF
- **Journal d'audit** - Traçabilité des actions
- **100% en français** - API, messages d'erreur et documentation

## 🚀 Installation

### Prérequis

- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm ou yarn

### Étapes

```bash
# Se placer dans le dossier du backend
cd nouveau_backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# JWT_SECRET (changez cette valeur!)
```

## 🗄️ Initialisation de la base de données

### 1. Créer la base de données

```sql
CREATE DATABASE teachers_plan;
```

### 2. Exécuter le script d'initialisation

```bash
npm run init-db
```

Ce script va:
- Créer toutes les tables
- Insérer les données de démo
- Configurer les comptes de test

### Comptes de test créés

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@teachersplan.com | pass1234 |
| RH | rh@teachersplan.com | pass1234 |
| Enseignant | prof@teachersplan.com | pass1234 |

## ▶️ Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur sera disponible sur: `http://localhost:5000`

## 📡 API Reference

### Authentification

#### Connexion
```http
POST /api/auth/connexion
Content-Type: application/json

{
  "email": "admin@teachersplan.com",
  "mot_de_passe": "pass1234"
}
```

Réponse:
```json
{
  "succes": true,
  "message": "Connexion réussie",
  "donnees": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "utilisateur": {
      "id": "uuid",
      "email": "admin@teachersplan.com",
      "role": "admin",
      "nom": "Admin",
      "prenom": "Système"
    }
  }
}
```

#### Récupérer son profil
```http
GET /api/auth/profil
Authorization: Bearer <token>
```

#### Modifier son mot de passe
```http
PUT /api/auth/mot-de-passe
Authorization: Bearer <token>
Content-Type: application/json

{
  "ancien_mot_de_passe": "pass1234",
  "nouveau_mot_de_passe": "nouveau123"
}
```

### Enseignants

#### Liste des enseignants
```http
GET /api/enseignants
Authorization: Bearer <token>
```

#### Créer un enseignant
```http
POST /api/enseignants
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Diop",
  "prenoms": "Cheikh",
  "email": "cheikh.diop@univ.sn",
  "telephone": "77 123 45 67",
  "grade": "Professeur",
  "departement_id": "uuid-du-departement",
  "statut": "actif",
  "mot_de_passe": "temp1234"
}
```

#### Modifier un enseignant
```http
PUT /api/enseignants/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "NouveauNom",
  "grade": "Maître de Conférences"
}
```

#### Supprimer un enseignant
```http
DELETE /api/enseignants/:id
Authorization: Bearer <token>
```

### Dashboard

#### Statistiques générales
```http
GET /api/dashboard/statistiques
Authorization: Bearer <token>
```

## 🏗️ Structure du Projet

```
nouveau_backend/
├── config/
│   ├── auth.js          # Configuration JWT
│   └── db.js            # Connection PostgreSQL
├── controllers/
│   ├── auth.controller.js
│   ├── enseignant.controller.js
│   └── ... (autres contrôleurs)
├── middlewares/
│   ├── auth.middleware.js   # Vérification token & rôles
│   ├── audit.middleware.js  # Journalisation
│   └── errorHandler.js      # Gestion erreurs
├── models/                   # (Optionnel - ORM manuel)
├── routes/
│   ├── auth.routes.js
│   ├── enseignant.routes.js
│   └── ... (autres routes)
├── utils/
│   └── init-db.js           # Script d'initialisation
├── schema.sql               # Schéma complet de la BD
├── server.js                # Point d'entrée
├── package.json
└── .env.example
```

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt (10 rounds)
- Tokens JWT avec expiration configurable
- Middleware de vérification des rôles
- Protection contre les injections SQL (requêtes paramétrées)
- CORS configuré pour le frontend uniquement

## 📝 Messages d'Erreur

Toutes les réponses d'erreur sont en français:

```json
{
  "succes": false,
  "message": "Email ou mot de passe incorrect",
  "code": "AUTH_ECHEC"
}
```

Codes d'erreur courants:
- `TOKEN_EXPIRE` - Session expirée
- `DONNEE_EXISTANTE` - Doublon détecté
- `DONNEES_LIEES` - Suppression impossible
- `VALIDATION_ECHEC` - Données invalides

## 🔄 Transactions

Les opérations critiques (création d'enseignant + utilisateur) utilisent des transactions PostgreSQL pour garantir l'intégrité des données.

## 📊 Base de Données

Le schéma inclut:
- 18 tables principales
- Contraintes de clés étrangères
- Index optimisés
- Triggers de mise à jour automatique
- Données de démo complètes

## 🛠️ Développement

### Ajouter une nouvelle entité

1. Créer la table dans `schema.sql`
2. Créer le controller dans `controllers/`
3. Créer les routes dans `routes/`
4. Importer les routes dans `server.js`

### Bonnes pratiques

- Toujours utiliser des requêtes paramétrées
- Gérer les erreurs avec le middleware
- Journaliser les actions importantes
- Valider les données en entrée
- Utiliser des transactions pour les opérations multiples

## 📞 Support

Pour toute question ou problème, consultez la documentation complète ou contactez l'équipe de développement.

---

**Teacher's Plan** - Système de gestion des emplois du temps © 2024
