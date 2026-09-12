# Architecture Notes

## Upload flow

```text
Browser
  -> create upload session
  -> split file into 5 MB chunks
  -> upload up to 4 chunks concurrently
  -> API calculates SHA-256
  -> API selects 2 healthy storage nodes
  -> both replicas are written
  -> PostgreSQL records checksum + replica locations
  -> upload is marked ready when every chunk exists
```

## Download flow

For every chunk, the API tries recorded replicas until it finds a healthy copy whose SHA-256 checksum matches. Chunks are streamed back in order, reconstructing the original file.

## Failure tolerance

With replication factor 2, one storage-node failure can be tolerated as long as each chunk still has another healthy replica.

## Metadata tables

```text
users
files
file_versions
chunks
```

Each chunk stores its index, size, checksum and replica-node list.
