import ollama from 'ollama'
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { createInterface } from "node:readline/promises";
import { Client } from "pg";
import pgvector from 'pgvector/pg';
import 'dotenv/config'

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const MODEL_NAME = "gemini-2.0-flash";
const MODEL_EMBED_NAME="qwen3-embedding:0.6b";

/**
*
* @param
*
* @return
*/
async function EmbedUserQuery(query) {
    const res = await ollama.embed({
        model: MODEL_EMBED_NAME,
        truncate: true,
        input: query,
    })
   //const f = new Float32Array(res.embeddings.flat())
   return  res.embeddings[0]
}

/**
*
* @param
*
* @return
*/
function cosineSimilarity(v1, v2) {
    //console.log("using js native")
    v1 = new Float32Array(v1.buffer)
    v2 = new Float32Array(v2.buffer)
    if (v1.length !== v2.length) {
        throw new Error("Vectors must be of the same length.");
    }
    let dot = 0, norm1Sq = 0, norm2Sq = 0;
    for (let i = 0; i < v1.length; i++) {
        const a = v1[i];
        const b = v2[i];
        dot += a * b;
        norm1Sq += a * a;
        norm2Sq += b * b;
    }
    return dot / (Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq));
}

/**
*
* @param
*
* @return
*/
async function CheckSimalirity(query, sess) {
  try{
    await client.connect();
    await pgvector.registerTypes(client);
    const qvec = await EmbedUserQuery(query)
    //console.log(qvec);
    console.log(`qvec.len=`, qvec.length);
    const result = await client.query(
      `
      SELECT content, embedding <-> $1 AS distance
      FROM documents
      ORDER BY distance
      LIMIT 3
      `,
      [pgvector.toSql(qvec)]
    );    
    client.end()  

    const contexts = result.rows.map((r) => r.content).join("\n---\n");
    let matches = contexts;

    return matches !== `` ? `
     context: ${matches}\n
     user query: ${query}
    ` : query    
  }catch(e){
    console.log(e)
  }
}

/**
*
* @param
*
* @return
*/
export async function Chat(userQuery, sess) {
  const query = await CheckSimalirity(userQuery, sess);

  const newQuery = `
***
日本語で、回答して欲しい。
${query}
`;
  console.log("formatted query: ", newQuery)
  
  const result = await generateText({
    model: google(MODEL_NAME),
    maxSteps: 5,
    messages: [{ role: "user", content: newQuery }],
  });
  console.log("artifact:");
  console.log(result.text);
  return result.text;
}