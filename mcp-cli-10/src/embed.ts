import { readFileSync, readdirSync } from "fs";
import { generateText, tool } from "ai";
import { embed , embedMany } from 'ai';
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import 'dotenv/config';

process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
//console.log("GOOGLE_GENERATIVE_AI_API_KEY=", process.env.GOOGLE_GENERATIVE_AI_API_KEY);
//console.log("GOOGLE_API_KEY=", process.env.GOOGLE_API_KEY);

const db = new Database("embedblob.db");
const chunkSizeMax = 500; 
const CHUNK_MAX_COUNT = 100; 
const modlName = "text-embedding-004";

db.exec(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      sessid TEXT,
      name TEXT,
      content TEXT,
      embeddings BLOB
    );

    PRAGMA journal_mode = WAL;  -- Better write performance
  `);

const sesss = readdirSync("./data");
let data = {};
// {
//     sess1: [ '1.txt', '2.txt', '3.txt' ],
//     sess2: [ '1.txt', '2.txt', '3.txt' ]
//   }

for (const s of sesss) {
  const files = readdirSync(`./data/${s}`);
  data[s] = files;
}

/**
*
* @param
*
* @return
*/
async function main(){
  try{  
    let result = await validateChunkCount();
    console.log("result=", result);
    if(!result){
      throw new Error("Error, validateChunkCount")
      return;
    }
    const textSplitter = new CharacterTextSplitter({
      chunkSize: chunkSizeMax,
      chunkOverlap: 0,
    });
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || "",
    });
    const allText = [];
    let allTextCount = 0;
    const allEmbed = [];
    for (const [key, files] of Object.entries(data)) {
      for (const fileName of files) {
        const content = readFileSync(`./data/${key}/${fileName}`, "utf-8");
        let texts = await textSplitter.splitText(content);
        for (let i = 0; i < texts.length; i++) {
          console.log("i=" ,i)
          allText[allTextCount] = texts[i];
          let rowObj = { session: key, name: fileName };
          allEmbed.push({content: texts[i], meta: rowObj });
          allTextCount += 1;
        }
      }
      //console.log("#allText.len=" + allText.length);
      console.log("#allEmbed.len=" + allEmbed.length);
      const { embeddings } = await embedMany({
        model: google.textEmbeddingModel(modlName),
        values: allText,
      });
      console.log("#embeddings.len=" + embeddings.length);
      for (let i = 0; i < allEmbed.length; i++) {
        let row = allEmbed[i];
        if(embeddings[i]){
          let f = new Float32Array(embeddings[i].flat())
          saveToDb(f, row.meta, row.content);
        }
      }
      //console.log(embeddings)
    }
  }catch(e){
    console.log(e);
    throw new Error("Error, validateChunkCount")
  }
}
main();

/**
*
* @param
*
* @return
*/
async function validateChunkCount(){
  let ret = false;
  try{
    const items: any[] = [];
    let count = 0;

    for (const [key, files] of Object.entries(data)) {
      for (const f of files) {
        const content = readFileSync(`./data/${key}/${f}`, "utf-8");
        const textSplitter = new CharacterTextSplitter({
          chunkSize: chunkSizeMax,
          chunkOverlap: 0,
        });
        let texts = await textSplitter.splitText(content);
        count += texts.length;
        console.log("name=", f)
        console.log("texts.len=", texts.length)
        console.log("texts.count=", count)
      }
    }
    if(count >= CHUNK_MAX_COUNT){
      return ret;
    }
    return true;
  }catch(e){
    throw new Error("Error, validateChunkCount")
  }
}

/**
*
* @param
*
* @return
*/
async function saveToDb(embeddings, meta, content) {
  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
        INSERT INTO embeddings
        VALUES (?, ?, ?, ?, ?)
      `);
    const id = uuidv4()
    stmt.run(id,meta.session, meta.name, content, embeddings);
  });

  transaction();
}

