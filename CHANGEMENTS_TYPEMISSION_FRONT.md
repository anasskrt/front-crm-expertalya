# Migration TypeMission : Enum → Table dynamique

## Contexte

Le type de mission n'est plus une valeur fixe (enum). Il est désormais stocké dans une **table dédiée** en base de données, ce qui permet d'ajouter/supprimer des types de mission depuis l'application.

---

## Nouveaux endpoints — `/typemission`

| Méthode | URL | Rôle requis | Description |
|--------|-----|-------------|-------------|
| `GET` | `/typemission` | Authentifié | Liste tous les types de mission |
| `POST` | `/typemission` | Rôle 1 (admin) | Crée un nouveau type de mission |
| `DELETE` | `/typemission/:id` | Rôle 1 (admin) | Supprime un type de mission |

### `GET /typemission` — Réponse

```json
[
  { "id": 1, "mission": "TENUE_COMPTABLE", "createdAt": "...", "updatedAt": "..." },
  { "id": 2, "mission": "DECLARATION_TVA", "createdAt": "...", "updatedAt": "..." },
  { "id": 3, "mission": "REVISION", "createdAt": "...", "updatedAt": "..." }
]
```

### `POST /typemission` — Body

```json
{ "mission": "NOM_DU_TYPE" }
```

Retourne le type créé. Renvoie **409** si le nom existe déjà.

### `DELETE /typemission/:id` — Réponse

```json
{ "message": "Type de mission supprimé avec succès" }
```

---

## Modifications sur `/mission`

### Création d'une mission — `POST /mission`

**Avant :**
```json
{
  "exerciceId": 1,
  "type": "TENUE_COMPTABLE",
  "terminer": false
}
```

**Maintenant :**
```json
{
  "exerciceId": 1,
  "typeMissionId": 1,
  "terminer": false
}
```

> Le champ `type` (string enum) est **supprimé**. Il faut envoyer `typeMissionId` (entier), qui correspond à l'`id` récupéré via `GET /typemission`.

---

### Structure des réponses mission (tous les endpoints GET/POST/PATCH)

Toutes les réponses incluent désormais l'objet `typeMission` :

```json
{
  "id": 5,
  "exerciceId": 2,
  "typeMissionId": 1,
  "typeMission": {
    "id": 1,
    "mission": "TENUE_COMPTABLE"
  },
  "terminer": false,
  "dateDeCloture": null,
  "collaborateur": { "id": 3, "name": "Dupont", "firstName": "Jean" },
  "manager": null,
  "exercice": {
    "id": 2,
    "dateCloture": "...",
    "dateMiseEnCloture": "...",
    "societe": { "id": 1, "name": "ACME SARL" }
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Comportement lors de la création d'un exercice

Lors d'un `POST /exercice`, les missions sont **créées automatiquement** pour **tous les types de mission présents en base** au moment de la création.

> Si la table TypeMission est vide, aucune mission ne sera créée automatiquement.

---

## Ce qu'il faut adapter côté front

1. **Formulaire de création/édition de mission**
   - Remplacer le select à valeurs fixes (enum) par un select **dynamique** alimenté par `GET /typemission`
   - Envoyer `typeMissionId: number` au lieu de `type: string`

2. **Affichage du type de mission**
   - Lire `mission.typeMission.mission` au lieu de `mission.type`

3. **Page d'administration (rôle 1)**
   - Ajouter une section pour gérer les types de mission (liste, ajout, suppression) via les endpoints `/typemission`

4. **Chargement initial**
   - Charger la liste des types (`GET /typemission`) au démarrage ou à l'ouverture des formulaires concernés
