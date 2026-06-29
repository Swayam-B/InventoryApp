# Home Inventory PWA

A mobile-first Progressive Web App for managing a personal home inventory —
organize items into **Locations → Containers → Items**, track quantities with
atomic increment/decrement, auto-build a shopping list from low-stock items,
and search everything instantly.

## Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Zustand, `browser-image-compression`,
  `lucide-react`, `react-router-dom`
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose, referenced architecture)
- **Storage:** AWS S3 via presigned URLs (images never pass through the server)
- **Auth:** Zero-friction PIN → JWT in an `httpOnly` `Secure` `SameSite=Strict`
  cookie, with rate-limited login

## Project Structure

```
backend/
  server.js              Express app, middleware, route wiring
  middleware/auth.js     JWT cookie verification (protects all non-login routes)
  models/                Location, Container, Item (Mongoose schemas + indexes)
  routes/                auth, upload (presigned URL), locations, containers, items, search
  utils/s3.js            AWS S3 client
frontend/
  src/
    store/useStore.js    Zustand global state (search overlay, auth, toasts)
    lib/                  api client, image upload, debounce hook
    components/          Navbar, SearchOverlay, ItemRow, Toasts
    pages/               Login, Locations, LocationDetail, ContainerDetail, ShoppingList
  public/                manifest.json, sw.js, icons
```

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, AWS_* , SECRET_APP_PIN
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api → :5000)
```

The default PIN is `1901` (set via `SECRET_APP_PIN`).

## Key API Routes

| Method | Route | Notes |
| ------ | ----- | ----- |
| POST   | `/api/auth/login` | Rate-limited (5 / 15 min), sets JWT cookie |
| GET    | `/api/upload/presigned-url` | 60s S3 PUT url + imageKey |
| GET    | `/api/upload/view-url` | 300s S3 GET url to display a stored image |
| CRUD   | `/api/locations`, `/api/containers`, `/api/items` | Cascading deletes |
| PATCH  | `/api/items/:id/increment` | Atomic `$inc`, clears restock flag |
| PATCH  | `/api/items/:id/decrement` | Aggregation pipeline; sets restock at 0 |
| GET    | `/api/items?needsRestock=true` | Shopping list w/ computed path |
| GET    | `/api/search?q=...` | `$text` + `$lookup` aggregation, returns path |

## Notes

- **Atomic quantity updates** prevent race conditions; decrement uses a MongoDB
  aggregation pipeline to flag `needsRestock` exactly when quantity reaches 0.
- **Optimistic UI** on the +/- controls — state updates instantly and reverts
  with an error toast on failure.
- **Images** are compressed client-side (max 0.5 MB / 1024px) and uploaded
  directly to S3 via presigned URL; only the `imageKey` is stored in MongoDB.
