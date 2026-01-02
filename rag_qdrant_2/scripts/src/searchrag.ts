//@ts-ignore
import { parseArgs } from 'node:util';
import {QdrantClient} from '@qdrant/js-client-rest';
import 'dotenv/config'
import config from "./config.js"

const GOOGLE_API_KEY = config.GOOGLE_API_KEY;
//console.log("GOOGLE_API_KEY=", GOOGLE_API_KEY)
// コレクション名
const COLLECT_NAME = "sample_collection"
const main = async function(){
  const options = {
    // 受け取りたい引数の定義
    message: {
      type: 'string', // 文字列として受け取る
      short: 'm',     // -m でも受け取れる
    },
  };

  //@ts-ignore
  const { values } = parseArgs({ options });

  // 実行結果の確認
  //console.log("messageは: "+ values.message);
  const query = values.message

  const result = await Chat(query)
  console.log(result)
  return result;

}
main();


/**
*
* @param
*
* @return
*/
async function EmbedUserQuery(query) {
  const apiKey= GOOGLE_API_KEY;
  let ret = null
  try{
      const item = {"model": "models/gemini-embedding-001",
      "content": {"parts":[{"text": query}]}
      }
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const text = await response.text();
      console.log(text);
      throw new Error('Failed to create item');
    }else{
      //console.log("OK");
      const json = await response.json();
      const out = json.embedding.values
      ret = out;
    }
    return ret;
  }catch(e){
    console.log(e)
    throw new Error("error in EmbedUserQuery")
  }  
}

/**
*
* @param
*
* @return
*/
async function CheckSimalirity(query) {
  try{
    const client = new QdrantClient({url: 'http://127.0.0.1:6333'});

    const queryEmbedding = await EmbedUserQuery(query);
    //console.log(`qvec.len=`, queryEmbedding.length);
    let targetEmbed = null;
    if(queryEmbedding.length === 0) {
      throw new Error("error, queryEmbedding none");
    }
    const result = await client.search(COLLECT_NAME, {
      vector: queryEmbedding,
      limit: 2,
    });
    let matches = "";
    let ouStr = "";
    result.forEach((doc, i) => {
      let content = doc.payload.content
      ouStr += content + "\n\n";
    })
     return ouStr !== `` ? `
     context: ${ouStr}\n
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
export async function Chat(userQuery) {
  const apiKey= GOOGLE_API_KEY;
  const query = await CheckSimalirity(userQuery);
  //console.log("query=", query)
  return query;
}