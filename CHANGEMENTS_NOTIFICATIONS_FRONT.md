# Système de notifications internes

## Contexte

Un système de notifications internes a été ajouté au backend. Il permet d'afficher une **icône de cloche** dans l'interface avec un compteur de notifications non lues. Les notifications sont propres à chaque utilisateur connecté.

**Premier cas d'usage implémenté :** quand un utilisateur est affecté en tant que collaborateur à une mission, il reçoit automatiquement une notification.

---

## Endpoints disponibles — `/notification`

Tous les endpoints nécessitent un **token JWT valide** (utilisateur connecté).

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/notification` | Récupère toutes les notifications de l'utilisateur connecté |
| `GET` | `/notification/non-lues` | Retourne le **nombre** de notifications non lues (pour la cloche) |
| `PATCH` | `/notification/lire-tout` | Marque toutes les notifications comme lues |
| `PATCH` | `/notification/:id/lire` | Marque une notification spécifique comme lue |

---

## Détail des réponses

### `GET /notification`

Retourne un tableau de notifications, triées de la plus récente à la plus ancienne.

```json
[
  {
    "id": 12,
    "userId": 3,
    "message": "Vous avez été affecté à la mission \"TVA\" pour la société ACME SARL.",
    "lu": false,
    "type": "MISSION",
    "createdAt": "2026-03-18T14:32:00.000Z"
  },
  {
    "id": 8,
    "userId": 3,
    "message": "Vous avez été affecté à la mission \"Révision\" pour la société Dupont SAS.",
    "lu": true,
    "type": "MISSION",
    "createdAt": "2026-03-15T09:10:00.000Z"
  }
]
```

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `number` | Identifiant unique |
| `userId` | `number` | ID de l'utilisateur destinataire |
| `message` | `string` | Texte affiché dans la notification |
| `lu` | `boolean` | `false` = non lue (point rouge), `true` = lue |
| `type` | `string` | Type de notification (`"MISSION"`, `"INFO"`, ...) |
| `createdAt` | `string` | Date ISO de création |

---

### `GET /notification/non-lues`

Retourne un **entier** uniquement. À utiliser pour le badge de la cloche.

```json
3
```

---

### `PATCH /notification/:id/lire`

Marque une notification précise comme lue. Appeler au clic sur la notification.

Retourne :
```json
{ "count": 1 }
```

---

### `PATCH /notification/lire-tout`

Marque toutes les notifications de l'utilisateur comme lues. Appeler au clic sur "Tout marquer comme lu".

Retourne :
```json
{ "count": 3 }
```

---

## Comportement automatique (côté backend)

Le backend crée automatiquement une notification dans les cas suivants :

| Événement | Destinataire | Message |
|-----------|-------------|---------|
| Affectation d'un collaborateur à une mission (création) | Le collaborateur affecté | `"Vous avez été affecté à la mission "[type]" pour la société [nom]."` |
| Changement de collaborateur sur une mission (mise à jour) | Le nouveau collaborateur | `"Vous avez été affecté à la mission "[type]" pour la société [nom]."` |

> L'ancien collaborateur retiré d'une mission **ne reçoit pas** de notification pour l'instant.

---

## Ce qu'il faut implémenter côté front

### 1. Icône de cloche dans le header

- Au chargement de l'app (et à intervalle régulier, ex. toutes les 30–60 secondes), appeler `GET /notification/non-lues`
- Afficher un **badge rouge** sur la cloche si le compteur est > 0
- Au clic sur la cloche → ouvrir un panneau/dropdown et appeler `GET /notification`

### 2. Panneau de notifications

- Lister les notifications reçues
- Différencier visuellement les non lues (`lu: false`) des lues (`lu: true`)
- Au clic sur une notification → appeler `PATCH /notification/:id/lire` pour la marquer comme lue
- Bouton "Tout marquer comme lu" → appeler `PATCH /notification/lire-tout`, puis rafraîchir la liste et le compteur

### 3. Polling recommandé

Il n'y a pas de WebSocket pour l'instant. Utiliser un **polling léger** sur `GET /notification/non-lues` :

```ts
// Exemple React — polling toutes les 30 secondes
useEffect(() => {
  const fetchCount = () => api.get('/notification/non-lues').then(res => setCount(res.data));
  fetchCount();
  const interval = setInterval(fetchCount, 30_000);
  return () => clearInterval(interval);
}, []);
```

---

## Types TypeScript suggérés

```ts
export interface Notification {
  id: number;
  userId: number;
  message: string;
  lu: boolean;
  type: 'MISSION' | 'INFO' | string;
  createdAt: string;
}
```

---

## Note sur la doc TypeMission existante

Dans `CHANGEMENTS_TYPEMISSION_FRONT.md`, les exemples de réponse utilisent `typeMission.mission` mais le vrai nom du champ en base est **`libelle`**. Les réponses réelles contiennent donc :

```json
"typeMission": {
  "id": 1,
  "libelle": "TENUE_COMPTABLE"
}
```

Adapter les affichages en conséquence : lire `mission.typeMission.libelle` et non `mission.typeMission.mission`.
