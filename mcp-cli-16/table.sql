CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  sessid TEXT,
  name TEXT,
  content TEXT,
  embeddings BYTEA
);
