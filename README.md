# Distributed Cloud Storage System

A portfolio-grade mini distributed object storage system inspired by cloud storage architecture.

## Features

- JWT authentication
- 5 MB chunked uploads
- Concurrent chunk uploads from the browser
- Three independent storage nodes
- Replication factor 2
- SHA-256 checksum verification
- PostgreSQL metadata database
- Redis metadata caching
- Resumable-upload status endpoint
- File version model
- Streaming file reconstruction/download
- Storage-node health checks
- Replica rebalancing / recovery endpoint
- Docker Compose setup

## Architecture

```text
Browser
   |
   v
FastAPI API
   |----> PostgreSQL (metadata)
   |----> Redis (cache)
   |
   +----> Storage A
   +----> Storage B
   +----> Storage C

File -> 5 MB chunks -> each chunk stored on 2 nodes
```

## Run

Install Docker Desktop, then from this folder run:

```bash
docker compose up --build
```

Open the frontend:

```text
http://localhost:8080
```

Open API docs:

```text
http://localhost:8000/docs
```

## Demo fault tolerance

1. Register/login.
2. Upload a 20–50 MB file.
3. Verify all three storage nodes show healthy.
4. Stop one node:

```bash
docker compose stop storage-b
```

5. Download the file again. It should still work because chunks have another replica.
6. Restart the node:

```bash
docker compose start storage-b
```

7. Use `POST /admin/rebalance` in Swagger to restore missing redundancy.

## How resumable uploads work

The client creates an upload session using:

```text
POST /uploads/start
```

The server returns `version_id`, `chunk_size` and `total_chunks`.

The client can then call:

```text
GET /uploads/{version_id}/status
```

to learn which chunks already exist and upload only missing chunks.

## File versioning

The backend supports versions. When calling `/uploads/start`, send `existing_file_id` to create a new version of an existing file instead of a new file object.

## Portfolio description

> Distributed Object Storage System — fault-tolerant storage service with chunking, replicated storage nodes, SHA-256 integrity verification, resumable concurrent uploads, Redis caching, file versioning and replica recovery.

## Best interview demo

- Show the architecture.
- Upload a large file and explain the chunk split.
- Explain rotating replica placement.
- Stop a storage node.
- Download successfully anyway.
- Restart the node and run rebalancing.
- Explain why the system still works during a node failure.

## Next upgrades

- Background repair worker
- Prometheus/Grafana metrics
- Load testing with Locust
- Storage quotas
- Consistent hashing
- Deduplication
- Encryption at rest
- Signed download URLs
- S3-compatible API subset
