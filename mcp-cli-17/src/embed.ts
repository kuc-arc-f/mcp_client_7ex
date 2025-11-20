import { readFileSync, readdirSync } from "fs";
import ollama from "ollama";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Pool } from 'pg';
import 'dotenv/config'

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const DATA_PATH = `./data`;
const MODEL_NAME="embeddinggemma";

async function main() {
  const files = readdirSync(DATA_PATH);

  //console.log(files)
  for (const f of files) {
    const content = readFileSync(`${DATA_PATH}/${f}`, "utf-8");
    await Embed(content, { session: "", name: f });
  }
  await pool.end()
}
main();

/**
*
* @param
*
* @return
*/
async function saveToDb(embeddings, meta, content) {
  console.log("name=", meta.name)
  //console.log(meta, embeddings)
  //console.log("content=", content.substring(0, 20))
  try{
    const id = uuidv4()
    const sql = `
      INSERT INTO embeddings (id, name, content, embeddings) 
      VALUES ($1, $2, $3, $4)
    `;
    const values = [id, meta.name , content, embeddings];
    const result = await pool.query(sql, values);    
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
async function Embed(content, meta) {
  const chunkSizeMax = 500; 
  //console.log(meta, content.substring(0, 20))
  const textSplitter = new CharacterTextSplitter({
    chunkSize: chunkSizeMax,
    chunkOverlap: 0,
  });
  const texts = await textSplitter.splitText(content);
  for (let i = 0; i < texts.length; i++) {
    let target = texts[i];
    //console.log("i=", i)
    const res = await ollama.embed({
      model: MODEL_NAME,
      truncate: true,
      input: target,
    });
    meta.model = res.model;
    const f = new Float32Array(res.embeddings.flat())
    await saveToDb(f, meta, target);
  }
  return;
}


