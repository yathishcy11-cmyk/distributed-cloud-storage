# DSOS — `/s1/` Frontend

This folder is the GitHub Pages frontend/demo for the **Distributed Object Storage System**.

## What is included

- Interactive storage dashboard
- Cluster health cards
- 3-node visualization
- File upload simulation
- 5 MB chunk visualization
- Replication-factor-2 feedback
- SHA-256 integrity feedback
- Node failure simulation
- Replica recovery simulation
- Architecture diagram
- Event/observability stream
- Responsive mobile layout
- No external JavaScript libraries or build step

## GitHub Pages

If this folder is placed at:

```text
s1/
  index.html
  style.css
  app.js
  assets/
```

then GitHub Pages can serve it at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/s1/
```

## Connecting the real backend

The current `/s1/` page is intentionally **frontend-only** so it works on GitHub Pages.

When your FastAPI backend is deployed, replace the simulation inside `app.js` with API calls to endpoints such as:

```text
POST /auth/login
POST /auth/register
POST /uploads/start
PUT  /uploads/{version_id}/chunks/{index}
POST /uploads/{version_id}/complete
GET  /files
GET  /files/{id}/download
GET  /health
```

Do not put private database passwords, service-role keys, or other secrets in this folder.

## Portfolio description

> Fault-tolerant distributed object storage system with client-side chunking, concurrent uploads, replication, checksum verification, PostgreSQL metadata, Redis caching, resumable uploads and node-failure recovery.
