import ollama from 'ollama'
import { generateText, tool } from "ai";
//import { z } from "zod";
import { google } from "@ai-sdk/google";
import { createInterface } from "node:readline/promises";
import { Pool } from 'pg';
import 'dotenv/config'


const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
const MODEL_NAME = "gemini-2.0-flash";
const MODEL_EMBED_NAME="embeddinggemma";

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
        // truncate: true
    })
   const f = new Float32Array(res.embeddings.flat())
    return  f
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
    const sql = `SELECT * FROM embeddings;`;
    const result = await pool.query(sql, "");
    pool.end()
    if (result.rowCount === 0) {
      console.log(`error, embeddings count = 0`);
      return "";
    }

    let matches = ``
    if (result.rowCount > 0) {
        const embedding = await EmbedUserQuery(query)
        for (const row of result.rows) {
            const e = new Float32Array(row.embeddings.buffer)
            const sim = cosineSimilarity(embedding, e)
            //console.log(`doc: ${row.name}, similarity: ${sim}, user query: ${query}`)
            console.log(`doc: ${row.name}, similarity: ${sim}`)
            //console.log(`${sim}`)
            if (sim > 0.5) {
                matches += row.content + "\n"
            }
        }
    }

    return matches !== `` ? `
     context: ${matches}\n
     user query: ${query}
    ` : query

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