# Changements Backend - CRM ExpertAlya
## Refactorisation Exercices → Missions (Mars 2026)

Ce document résume les modifications apportées au backend pour la refactorisation du système d'exercices. L'objectif est de permettre à une IA de mettre à jour le frontend en conséquence.

---

## 📋 Résumé des changements

### Concept clé
- **AVANT** : Une société avait directement une liste d'`exercice` (qui étaient en fait des types de missions : TVA, Révision, etc.)
- **APRÈS** : 
  - Un **Exercice** = période comptable annuelle (ex: 01/01/2026 → 31/12/2026)
  - Une **Mission** = tâche liée à un exercice (ex: TVA, Révision, Tenue comptable, etc.)
  - Une société a plusieurs exercices, et chaque exercice a plusieurs missions

---

## 🗄️ Nouveaux modèles de données

### Modèle `Exercice` (période comptable)
```typescript
{
  id: number;
  societeId: number;
  dateCloture: DateTime;           // Date de clôture de l'exercice
  dateMiseEnCloture?: DateTime;    // Date de mise en clôture (optionnel)
  statut: 'EN_COURS' | 'TERMINE';
  missions: Mission[];             // Liste des missions de cet exercice
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Modèle `Mission` (anciennement "exercice")
```typescript
{
  id: number;
  exerciceId: number;              // Lié à un exercice (et non plus à une société)
  dateDeCloture?: DateTime;        // Date de clôture de la mission
  type: TypeMission;               // Type de mission (voir enum ci-dessous)
  terminer: boolean;               // Mission terminée ou non
  collaborateurId?: number;        // Collaborateur assigné
  managerId?: number;              // Manager assigné
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Enum `TypeMission`
```typescript
enum TypeMission {
  TENUE_COMPTABLE = 'TENUE_COMPTABLE',
  DECLARATION_TVA = 'DECLARATION_TVA',
  REVISION = 'REVISION',
  DEMANDE_INFO = 'DEMANDE_INFO',
  JURIDIQUE = 'JURIDIQUE',
  CONTENEUR_SUR_BALANCE = 'CONTENEUR_SUR_BALANCE',
  NOTE_DE_SYNTHESE = 'NOTE_DE_SYNTHESE',
  CADRAGE_TVA = 'CADRAGE_TVA',
  SOCIAL = 'SOCIAL',
}
```

### Enum `StatutExercice`
```typescript
enum StatutExercice {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
}
```

---

## 🔌 Nouvelles API

### API Exercice (`/exercice`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| `POST` | `/exercice` | Créer un exercice (crée automatiquement toutes les missions) | Admin (role=1) |
| `GET` | `/exercice` | Récupérer tous les exercices du cabinet | Tous |
| `GET` | `/exercice/societe/:societeId` | Récupérer les exercices d'une société | Tous |
| `GET` | `/exercice/:id` | Récupérer un exercice par ID | Tous |
| `PATCH` | `/exercice/:id` | Mettre à jour un exercice | Admin (role=1) |
| `DELETE` | `/exercice/:id` | Supprimer un exercice (et ses missions) | Admin (role=1) |

#### Corps de requête `POST /exercice`
```json
{
  "societeId": 1,
  "dateCloture": "2026-12-31",
  "dateMiseEnCloture": "2027-01-15",
  "statut": "EN_COURS"  // optionnel, défaut: EN_COURS
}
```

#### Corps de requête `PATCH /exercice/:id`
```json
{
  "dateCloture": "2026-12-31",
  "dateMiseEnCloture": "2027-01-15",
  "statut": "TERMINE"
}
```

#### Réponse type (GET)
```json
{
  "id": 1,
  "societeId": 1,
  "dateCloture": "2026-12-31T00:00:00.000Z",
  "dateMiseEnCloture": null,
  "statut": "EN_COURS",
  "societe": { "id": 1, "name": "Ma Société" },
  "missions": [
    {
      "id": 1,
      "type": "TENUE_COMPTABLE",
      "terminer": false,
      "collaborateur": { "id": 1, "name": "Dupont", "firstName": "Jean" },
      "manager": null
    },
    // ... autres missions
  ],
  "createdAt": "2026-03-11T10:00:00.000Z",
  "updatedAt": "2026-03-11T10:00:00.000Z"
}
```

---

### API Mission (`/mission`)

| Méthode | Endpoint | Description | Rôle requis |
|---------|----------|-------------|-------------|
| `POST` | `/mission` | Créer une mission | Admin (role=1) |
| `GET` | `/mission` | Récupérer toutes les missions du cabinet | Tous |
| `GET` | `/mission/toMe` | Récupérer mes missions (collaborateur connecté) | Tous |
| `GET` | `/mission/exercice/:exerciceId` | Récupérer les missions d'un exercice | Tous |
| `GET` | `/mission/manager/:collaborateurId` | Récupérer les missions d'un collaborateur | Admin (role=1) |
| `GET` | `/mission/:id` | Récupérer une mission par ID | Tous |
| `PATCH` | `/mission/:id` | Mettre à jour une mission | Voir gestion des droits |
| `PATCH` | `/mission/:id/terminer` | **NOUVEAU** Valider/invalider une mission | Voir gestion des droits |
| `DELETE` | `/mission/:id` | Supprimer une mission | Admin (role=1) |

---

### 🔐 Gestion des droits sur les Missions

#### Règles de permission

| Action | Admin (role=1) | Collaborateur assigné | Autre utilisateur |
|--------|----------------|----------------------|-------------------|
| Voir les missions du cabinet | ✅ | ✅ | ✅ |
| Voir ses propres missions (`/toMe`) | ✅ | ✅ | ✅ |
| Attribuer un collaborateur | ✅ | ❌ | ❌ |
| Attribuer un manager | ✅ | ❌ | ❌ |
| Valider une mission | ✅ | ✅ (sa mission seulement) | ❌ |
| Modifier la date de clôture | ✅ | ❌ | ❌ |
| Supprimer une mission | ✅ | ❌ | ❌ |

#### Endpoint `PATCH /mission/:id` (Mise à jour)

Ce endpoint permet de modifier une mission avec les règles suivantes :

**Pour un Admin (role=1)** :
- Peut modifier tous les champs : `collaborateurId`, `managerId`, `terminer`, `dateDeCloture`

**Pour un Collaborateur** :
- Peut uniquement modifier `terminer` sur les missions qui lui sont attribuées
- Si le collaborateur tente de modifier `collaborateurId` ou `managerId`, erreur **403 Forbidden** : 
  ```json
  { "message": "Seuls les administrateurs peuvent attribuer des missions" }
  ```
- Si le collaborateur tente de valider une mission qui ne lui est pas attribuée, erreur **403 Forbidden** :
  ```json
  { "message": "Vous ne pouvez valider que les missions qui vous sont attribuées" }
  ```

#### Endpoint `PATCH /mission/:id/terminer` (Validation)

Endpoint dédié pour valider ou invalider une mission. Plus simple à utiliser que `PATCH /mission/:id`.

**Corps de requête** :
```json
{
  "terminer": true  // ou false pour invalider
}
```

**Comportement** :
- Un **Admin** peut valider/invalider n'importe quelle mission
- Un **Collaborateur** peut uniquement valider/invalider les missions qui lui sont attribuées
- La `dateDeCloture` est automatiquement définie à la date actuelle quand `terminer=true`
- La `dateDeCloture` est automatiquement effacée (null) quand `terminer=false`

**Réponse type** :
```json
{
  "id": 1,
  "type": "TENUE_COMPTABLE",
  "terminer": true,
  "dateDeCloture": "2026-03-11T15:30:00.000Z",
  "exercice": { "id": 1, "societe": { "id": 1, "name": "Ma Société" } },
  "collaborateur": { "id": 5, "name": "Dupont", "firstName": "Jean" },
  "manager": null
}
```

**Erreurs possibles** :
- **404 Not Found** : Mission introuvable ou non autorisée pour ce cabinet
- **403 Forbidden** : L'utilisateur n'est pas le collaborateur assigné et n'est pas admin

---

#### Corps de requête `POST /mission`
```json
{
  "exerciceId": 1,
  "type": "TENUE_COMPTABLE",
  "dateDeCloture": "2026-03-15",
  "terminer": false,
  "collaborateurId": 1,
  "managerId": 2
}
```

#### Corps de requête `PATCH /mission/:id`
```json
{
  "dateDeCloture": "2026-03-20",
  "terminer": true,
  "collaborateurId": 3,
  "managerId": 2
}
```

#### Réponse type (GET)
```json
{
  "id": 1,
  "exerciceId": 1,
  "type": "TENUE_COMPTABLE",
  "dateDeCloture": null,
  "terminer": false,
  "exercice": {
    "id": 1,
    "dateCloture": "2026-12-31T00:00:00.000Z",
    "dateMiseEnCloture": null,
    "societe": { "id": 1, "name": "Ma Société" }
  },
  "collaborateur": { "id": 1, "name": "Dupont", "firstName": "Jean" },
  "manager": { "id": 2, "name": "Martin", "firstName": "Pierre" },
  "createdAt": "2026-03-11T10:00:00.000Z",
  "updatedAt": "2026-03-11T10:00:00.000Z"
}
```

---

## 📊 Modifications sur l'API Société

### `GET /societe` - Nouveaux champs retournés

La liste des sociétés retourne maintenant ces nouveaux champs :

```json
{
  "id": 1,
  "name": "Ma Société",
  // ... autres champs existants ...
  
  // NOUVEAUX CHAMPS
  "exercicesTotal": 2,           // Nombre total d'exercices
  "exercicesEnCours": 1,         // Nombre d'exercices avec statut EN_COURS
  "missionsTotal": 18,           // Nombre total de missions (tous exercices)
  "missionsNonTerminees": 15,    // Nombre de missions non terminées
  "missionsNonAttribuees": true  // true si au moins une mission n'a pas de collaborateur
}
```

### `POST /societe` - Création automatique

Lors de la création d'une société :
1. Un **Exercice** est automatiquement créé avec :
   - `dateCloture` = `dateCloture1` de la société
2. **9 Missions** sont automatiquement créées pour cet exercice (une de chaque type)

---

## 🔄 Correspondance ancien → nouveau

| Ancien concept | Nouveau concept |
|----------------|-----------------|
| `exercice` (table) | `Mission` (table) |
| `exercice.societeId` | `Mission.exerciceId` (via Exercice) |
| `exercice.type` (typeMissionExercice) | `Mission.type` (TypeMission) |
| `exercice.terminer` | `Mission.terminer` |
| `exercice.dateDebut` | **Supprimé** (la période est sur l'Exercice) |
| `exercice.dateFin` | **Supprimé** (remplacé par `dateDeCloture` sur Mission) |
| `exercice.dateDernierPointage` | `Mission.dateDeCloture` |
| `exercice.collaborateurId` | `Mission.collaborateurId` |
| `exercice.managerId` | `Mission.managerId` |
| `/exercice/toMe` | `/mission/toMe` |
| `/exercice/societe/:id` | `/exercice/societe/:id` (retourne exercices avec missions) |

---

## 🎯 Actions requises côté Frontend

### 1. Renommer les concepts
- Remplacer "exercice" par "mission" dans l'interface utilisateur pour les tâches (TVA, Révision, etc.)
- Ajouter le concept d'"Exercice" pour les périodes comptables

### 2. Nouveaux écrans/composants
- **Liste des exercices d'une société** : afficher les périodes comptables
- **Détail d'un exercice** : afficher les missions associées
- **Formulaire de création d'exercice** : date de clôture, date de mise en clôture

### 3. Gestion des droits (UI)
- **Bouton "Valider mission"** : Afficher uniquement si l'utilisateur est admin OU est le collaborateur assigné
- **Boutons "Attribuer collaborateur/manager"** : Afficher uniquement pour les admins
- **Utiliser `PATCH /mission/:id/terminer`** : Pour valider/invalider une mission (simplifie la gestion)
- **Gérer les erreurs 403** : Afficher un message approprié si l'utilisateur n'a pas les droits

### 4. Modifier les appels API
- `/exercice/toMe` → `/mission/toMe` (pour les missions de l'utilisateur)
- `/exercice/societe/:id` → `/exercice/societe/:id` (retourne les exercices avec missions imbriquées)
- Utiliser `/mission/*` pour la gestion des missions individuelles

### 4. Mettre à jour les types TypeScript
```typescript
// Nouveau type Exercice
interface Exercice {
  id: number;
  societeId: number;
  dateCloture: string;
  dateMiseEnCloture?: string;
  statut: 'EN_COURS' | 'TERMINE';
  missions: Mission[];
  societe?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

// Type Mission (anciennement Exercice)
interface Mission {
  id: number;
  exerciceId: number;
  type: TypeMission;
  dateDeCloture?: string;
  terminer: boolean;
  collaborateurId?: number;
  managerId?: number;
  collaborateur?: { id: number; name: string; firstName: string };
  manager?: { id: number; name: string; firstName: string };
  exercice?: {
    id: number;
    dateCloture: string;
    dateMiseEnCloture?: string;
    societe: { id: number; name: string };
  };
  createdAt: string;
  updatedAt: string;
}

type TypeMission = 
  | 'TENUE_COMPTABLE'
  | 'DECLARATION_TVA'
  | 'REVISION'
  | 'DEMANDE_INFO'
  | 'JURIDIQUE'
  | 'CONTENEUR_SUR_BALANCE'
  | 'NOTE_DE_SYNTHESE'
  | 'CADRAGE_TVA'
  | 'SOCIAL';

type StatutExercice = 'EN_COURS' | 'TERMINE';
```

### 5. Mise à jour des tableaux de sociétés
Les colonnes liées aux exercices doivent être renommées :
- `exercicesNonTermines` → `missionsNonTerminees`
- `exercicesNonAttribues` → `missionsNonAttribuees`
- Ajouter `exercicesTotal` et `exercicesEnCours`

---

## ⚠️ Points d'attention

1. **Création automatique** : Quand on crée un exercice, les 9 missions sont créées automatiquement. Pas besoin de les créer manuellement.

2. **Suppression en cascade** : Supprimer un exercice supprime aussi toutes ses missions.

3. **Relation hiérarchique** : 
   ```
   Société
     └── Exercice (période comptable)
           └── Mission (tâche : TVA, Révision, etc.)
   ```

4. **Les routes `/exercice/toMe` et `/exercice/manager/:id` n'existent plus** - utiliser `/mission/toMe` et `/mission/manager/:id`

---

## 📁 Fichiers modifiés côté Backend

```
prisma/
  └── schema.prisma          # Nouveaux modèles Exercice et Mission

src/
  ├── exercice/              # Module Exercice (périodes comptables)
  │   ├── exercice.controller.ts
  │   ├── exercice.service.ts
  │   ├── exercice.module.ts
  │   └── dto/
  │       ├── create-exercice.dto.ts
  │       └── update-exercice.dto.ts
  │
  ├── mission/               # NOUVEAU MODULE Mission
  │   ├── mission.controller.ts
  │   ├── mission.service.ts
  │   ├── mission.module.ts
  │   └── dto/
  │       ├── create-mission.dto.ts
  │       └── update-mission.dto.ts
  │
  ├── societe/
  │   └── societe.service.ts # Modifié pour créer exercice+missions
  │
  └── app.module.ts          # Ajout de MissionModule
```
