# Audit Log Dashboard

A full-stack dashboard for security engineers to upload, view, and investigate
system audit logs. Built with React, Node.js, Express, and MongoDB.

## Features

- **Bulk upload API** (`POST /api/logs/bulk`) — accepts up to 20,000 records in
  a single request and inserts them with `insertMany` for speed. Invalid rows
  are reported back individually instead of failing the whole batch.
- **Server-side filtering, search, sorting, and pagination** — the frontend
  never loads more than one page of data. All query logic (`find`, `sort`,
  `skip`, `limit`) runs in MongoDB, backed by indexes on the commonly
  filtered/sorted fields.
- **Dashboard UI** — filter by severity, status, region, action, resource
  type, and date range; free-text search across actor/action/resource/IP;
  click column headers to sort; paginate with adjustable page size.

## Project structure

```
audit-log-dashboard/
├── backend/          Express + MongoDB API
│   ├── config/db.js
│   ├── models/Log.js
│   ├── controllers/logController.js
│   ├── routes/logs.js
│   ├── scripts/generateSampleData.js   (creates 10,000 sample logs)
│   └── server.js
└── frontend/          React (Vite) dashboard
    └── src/
        ├── components/ (FilterBar, LogTable, Pagination, UploadPanel)
        ├── api.js
        └── App.jsx
```

## Setup

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local, or a free Atlas cluster)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI if needed
npm run dev                # starts on http://localhost:5000
```

### 2. Generate sample data (optional, for testing)

```bash
cd backend
node scripts/generateSampleData.js
# writes backend/scripts/sample-logs.json with 10,000 fake records
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173, then use "Upload log file (JSON)" and select
`backend/scripts/sample-logs.json` to load 10,000 test records, or upload a
file shaped like:

```json
{ "logs": [ { "actor": "...", "action": "...", "timestamp": "..." }, ... ] }
```

## API reference

| Method | Endpoint            | Description                                      |
|--------|----------------------|---------------------------------------------------|
| POST   | `/api/logs/bulk`     | Body: `{ "logs": [...] }`. Bulk inserts records.  |
| GET    | `/api/logs`          | Query params: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `from`, `to`, `severity`, `status`, `region`, `action`, `resourceType`, `actor`, `role` |
| GET    | `/api/logs/facets`   | Returns distinct values per field for filter dropdowns |

## Design notes / trade-offs

- **Search** uses case-insensitive regex across a few text fields rather than
  MongoDB's `$text` index, since regex supports partial substring matches
  (better UX for a search box) at the cost of not using the text index for
  very large collections. For much larger datasets, this would be a good
  place to introduce a dedicated search engine (e.g. Atlas Search/Elasticsearch).
- **insertMany with `ordered: false`** is used for bulk upload so a few bad
  rows don't block the rest of a 10,000-record batch from being inserted.
- Indexes are defined on `timestamp`, `severity`, `status`, `region`,
  `action`, and `actor` since those are the fields used for filtering/sorting.
