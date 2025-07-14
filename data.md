Perfect! Here's a set of **pre-seeded data** for local demo purposes for the *Manorath – Tokenized Dream Market* MVP. These JSON structures can be used in your **frontend mock state**, or served from your **backend's mock DB (e.g., `db.json`)**.

---

## 🧾 1. `dreams.json` — Dream NFTs

```json
[
  {
    "id": "dream-001",
    "owner": "0x9aBC...1234",
    "title": "Send daughter to college",
    "goal_amount": 200,
    "saved_amount": 120,
    "completed": false,
    "created_at": "2025-07-01"
  },
  {
    "id": "dream-002",
    "owner": "0x8eEF...5678",
    "title": "Start a buffalo dairy farm",
    "goal_amount": 500,
    "saved_amount": 500,
    "completed": true,
    "created_at": "2025-06-10"
  },
  {
    "id": "dream-003",
    "owner": "0x0DEa...ABCD",
    "title": "Build two-room house",
    "goal_amount": 1000,
    "saved_amount": 300,
    "completed": false,
    "created_at": "2025-06-25"
  }
]
```

---

## 🧾 2. `pledges.json` — Migrant Pledge Logs

```json
[
  {
    "dream_id": "dream-001",
    "pledger": "0x9aBC...1234",
    "amount": 50,
    "timestamp": "2025-07-10T10:00:00Z"
  },
  {
    "dream_id": "dream-001",
    "pledger": "0x9aBC...1234",
    "amount": 70,
    "timestamp": "2025-07-05T10:00:00Z"
  },
  {
    "dream_id": "dream-003",
    "pledger": "0x0DEa...ABCD",
    "amount": 100,
    "timestamp": "2025-07-01T10:00:00Z"
  }
]
```

---

## 🧾 3. `ngoVaults.json` — Conditional Matching Vaults

```json
[
  {
    "vault_id": "vault-001",
    "ngo": "0xNGO...4444",
    "dream_id": "dream-001",
    "match_amount": 100,
    "min_months": 3,
    "contributed_amount": 2,
    "active": true,
    "last_checked": "2025-07-11T08:00:00Z"
  },
  {
    "vault_id": "vault-002",
    "ngo": "0xNGO...9999",
    "dream_id": "dream-002",
    "match_amount": 150,
    "min_months": 2,
    "contributed_amount": 2,
    "active": false,
    "released_at": "2025-07-01T10:00:00Z"
  }
]
```

---

## 🧾 4. `legacyWall.json` — Fulfilled Dreams for Display

```json
[
  {
    "dream_id": "dream-002",
    "title": "Start a buffalo dairy farm",
    "owner": "0x8eEF...5678",
    "completed_at": "2025-07-01T10:00:00Z",
    "badge_url": "/badges/farm-complete.png"
  }
]
```

---

## 🧾 5. `users.json` — Migrant + NGO profiles (optional)

```json
[
  {
    "address": "0x9aBC...1234",
    "role": "migrant",
    "name": "Ramesh Chaudhary",
    "country": "Qatar"
  },
  {
    "address": "0xNGO...4444",
    "role": "ngo",
    "name": "EduNepal",
    "focus": "Higher Education"
  }
]
```

---

## 💡 How to Use

### Backend:

* Store them in a file (e.g. `db.json`)
* Read them into memory and serve via Express:

```js
const dreams = require('./data/dreams.json');
app.get('/api/dreams', (req, res) => res.json(dreams));
```

### Frontend:

* Import during local dev or use Axios fetch from the backend.
* Mock `useEffect`:

```js
useEffect(() => {
  fetch('/api/dreams')
    .then(res => res.json())
    .then(setDreams);
}, []);
```

---

## ✅ Next Steps

Would you like me to now:

* 🔨 Generate real dummy badge images for dreams?
* 🧑‍🎨 Create Tailwind UI cards using this data?
* 📤 Help you structure a `db.json` file for JSON Server?

Let me know what direction you want to go next!