# mcp-cli-21

 Version: 0.9.1

 date    : 2025/11/23
 
 update  :

***

node , RAG pgvector + Ollama

* embedding: qwen3-embedding:0.6b
* model: Gemini

***
### Setup
* .env

```
GOOGLE_GENERATIVE_AI_API_KEY=your-key

PG_USER=root
PG_HOST=localhost
PG_DATABASE=mydb
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
  embedding vector(1024)
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

https://zenn.dev/knaka0209/scraps/f543636cd8b77f

***
