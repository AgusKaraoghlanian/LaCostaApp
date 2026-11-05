-- La revisión de fuente y el presupuesto sobreviven a reinicios y reintentos.
ALTER TABLE import_jobs ADD COLUMN source_revision INTEGER;
ALTER TABLE import_jobs ADD COLUMN network_requests INTEGER NOT NULL DEFAULT 0;
ALTER TABLE import_jobs ADD COLUMN network_bytes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE import_jobs ADD COLUMN network_started_at INTEGER;
CREATE TABLE extraction_origins(hostname TEXT PRIMARY KEY,next_request_at INTEGER NOT NULL DEFAULT 0,cooldown_until INTEGER NOT NULL DEFAULT 0);
