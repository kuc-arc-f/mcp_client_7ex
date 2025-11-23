# mcp-cli-20

 Version: 0.9.1

 date    : 2025/11/23
 
 update  :

***

node + RAG + pgvector

* embedding: gemini-embedding-001
* model: Gemini

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
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(3072)
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

https://zenn.dev/knaka0209/scraps/7b2bf05f9f83d0

***
