import { readFileSync, readdirSync } from "fs";
import { generateText, tool } from "ai";
import { embed , embedMany } from 'ai';
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Pool } from 'pg';
import 'dotenv/config';

process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
//console.log("GOOGLE_API_KEY=", GOOGLE_API_KEY);

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const DATA_PATH = `./data`;

const chunkSizeMax = 500; 
const CHUNK_MAX_COUNT = 100; 
const modlName = "gemini-embedding-001";

let data = {};
/**
*
* @param
*
* @return
*/
async function main(){
  try{  
    const files = readdirSync(DATA_PATH);
  //console.log(files)

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
    for (const fileName of files) {
      const content = readFileSync(`./data/${fileName}`, "utf-8");
      let texts = await textSplitter.splitText(content);
      for (let i = 0; i < texts.length; i++) {
        //console.log("i=" ,i)
        allText[allTextCount] = texts[i];
        let rowObj = { session: "", name: fileName };
        allEmbed.push({content: texts[i], meta: rowObj });
        allTextCount += 1;
      }
    }
    //console.log(allEmbed);
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
        await saveToDb(f, row.meta, row.content);
      }
    }
    await pool.end()
  }catch(e){
    console.log(e);
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
  console.log("name=", meta.name)
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

