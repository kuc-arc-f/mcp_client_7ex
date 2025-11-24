import { readFileSync, readdirSync } from "fs";
import ollama from "ollama";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
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

const DATA_PATH = `./data`;
const MODEL_NAME="qwen3-embedding:0.6b";

async function main() {
  await client.connect(); 
  const files = readdirSync(DATA_PATH);
  await pgvector.registerTypes(client);

  //console.log(files)
  for (const f of files) {
    const content = readFileSync(`${DATA_PATH}/${f}`, "utf-8");
    await Embed(client, content, { session: "", name: f });
  }
  await client.end()
}
main();

/**
*
* @param
*
* @return
*/
async function saveToDb(client, embeddings, meta, content) {
  console.log("name=", meta.name)
  //console.log(meta, embeddings)
  //console.log("content=", content.substring(0, 20))
  try{
    const sql = `
    INSERT INTO documents (content, embedding) VALUES ($1, $2)
    `;
    const values = [content, pgvector.toSql(embeddings)];
    const result = await client.query(sql, values);    
  }catch(e){
    console.log(e)
    throw new Error("error, saveToDb")
  }
}

/**
 *
 * @param {string} content
 * @param {Object} meta
 */
async function Embed(client, content, meta) {
  const chunkSizeMax = 500; 
  //console.log("name=", meta.name)
  //console.log(meta, content.substring(0, 20))
  const textSplitter = new CharacterTextSplitter({
    chunkSize: chunkSizeMax,
    chunkOverlap: 0,
  });
  const texts = await textSplitter.splitText(content);
  for (let i = 0; i < texts.length; i++) {
    let target = texts[i];
    const res = await ollama.embed({
      model: MODEL_NAME,
      truncate: true,
      input: target,
    });
    meta.model = res.model;
    if(res.embeddings[0]){
      const row =res.embeddings[0];
      console.log("embeddings.len", row.length)
      await saveToDb(client, row, meta, target);
    }
  }
  return;
}


