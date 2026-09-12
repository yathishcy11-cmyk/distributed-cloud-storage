# Deploy YCloud publicly

GitHub Pages can host the frontend, but it cannot run the FastAPI/PostgreSQL/storage-node backend. This project therefore uses:

- GitHub Pages -> frontend
- Render -> FastAPI API
- Render Postgres -> metadata
- Render Key Value -> Redis-compatible cache
- 3 Render private services with persistent disks -> storage nodes A/B/C

## 1. Push this repository to GitHub

Upload the contents of this folder to a new repository. Keep `frontend/`, `api/`, `storage-node/`, and `render.yaml` at the repository root.

## 2. Deploy the backend on Render

In Render, choose **New -> Blueprint**, connect this GitHub repository, select `render.yaml`, review the resources, and deploy.

The Blueprint creates:

- `ycloud-api`
- `ycloud-storage-a`
- `ycloud-storage-b`
- `ycloud-storage-c`
- `ycloud-cache`
- `ycloud-db`

The storage nodes use persistent disks so uploaded chunks survive restarts/deploys. The storage services are intentionally private; only the API needs to be public.

## 3. Copy the API URL

After `ycloud-api` is deployed, copy its public URL, for example:

`https://ycloud-api-xxxx.onrender.com`

## 4. Configure the GitHub Pages frontend

Open `frontend/config.js` and replace:

`REPLACE_WITH_YOUR_API_URL`

with your actual API URL:

`window.YCLOUD_API_URL = 'https://ycloud-api-xxxx.onrender.com';`

Commit and push the change.

## 5. Enable GitHub Pages

In GitHub:

**Settings -> Pages -> Build and deployment -> Source: GitHub Actions**

The included `.github/workflows/pages.yml` will publish the `frontend/` directory.

## 6. Test

Open the GitHub Pages URL and:

1. Register an account.
2. Log in.
3. Upload an image, video, PDF, ZIP, or any other file.
4. Confirm it appears under Stored files.
5. Click Download.
6. The API reconstructs the file from its chunks and streams it back to the browser.

## Important cost note

This is a real multi-service deployment, not a GitHub-Pages-only demo. Render persistent disks are paid resources, and the free Postgres tier has a limited lifetime. Check Render's current pricing before deploying. If you want a permanently free architecture, replace the three storage nodes with a free object-storage provider and adjust the architecture accordingly.

## Local development

For local development, keep using:

`docker compose up --build`

Then open `http://localhost:8080`.

## Download path

The browser calls:

`GET /files/{file_id}/download`

The API reads chunk metadata from PostgreSQL, tries the healthy replicas in order, verifies each chunk's SHA-256 checksum, streams the chunks in order, and returns the original filename as a browser download.
