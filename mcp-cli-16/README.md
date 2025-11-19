# mcp-cli-16

 Version: 0.9.1

 date    : 2025/11/19
 
 update  :

***

node + RAG + postgres

* model: Gemini
* embedding: gemini-embedding-001
* node 22

***
### Setup
* .env

```
GOOGLE_GENERATIVE_AI_API_KEY=your-key

PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=postgres
PG_PASSWORD=admin
PG_PORT=5432
```

***
* data path: ./data

***
* table: table.sql

```
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  sessid TEXT,
  name TEXT,
  content TEXT,
  embeddings BYTEA
);

```
***
* verctor data add

```
npx tsx src/embed.ts
```

***

* start
```
npm run dev
```

***
### blog

***
