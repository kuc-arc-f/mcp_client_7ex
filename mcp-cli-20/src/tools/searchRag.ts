import { generateText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from 'ai';
import { createInterface } from "node:readline/promises";
import { Client } from "pg";
import pgvector from 'pgvector/pg';
import 'dotenv/config'
process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
//console.log("GOOGLE_API_KEY=", process.env.GOOGLE_API_KEY);

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const MODEL_NAME = "gemini-2.0-flash";
const MODEL_EMBED_NAME = "gemini-embedding-001";

/**
*
* @param
*
* @return
*/
async function EmbedUserQuery(query) {
    const googleModel = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY || "",
    });
    const { embedding } = await embed({
      model: googleModel.textEmbeddingModel(MODEL_EMBED_NAME),
      value: query,
    });
    //const f = new Float32Array(embedding.flat())
    return  embedding
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
    //SELECT * FROM documents ORDER BY embedding <-> $1 LIMIT 5
    client.end()
    const contexts = result.rows.map((r) => r.content).join("\n---\n");
    //console.log(`contexts=\n`, contexts);

    let matches = contexts;
    return matches !== `` ? `
     context: ${matches}\n
     user query: ${query}
    ` : query    

  }catch(e){
    client.end()
    console.log(e);
  }
  /*
  if (result.rowCount === 0) {
    console.log(`error, embeddings count = 0`);
    return "";
  }        
  */
}

/**
*
* @param
*
* @return
*/
export async function Chat(userQuery, sess) {
  const query = await CheckSimalirity(userQuery, sess);
  console.log("query: ", query)

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