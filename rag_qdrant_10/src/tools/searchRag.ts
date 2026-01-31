

import {QdrantClient} from '@qdrant/js-client-rest';
import { CopilotClient } from "@github/copilot-sdk";
import ollama from 'ollama'
import 'dotenv/config'


// コレクション名
const COLLECT_NAME = "document-3"

async function generateEmbedding(text) {
  const response = await ollama.embeddings({
    model: "qwen3-embedding:0.6b",
    prompt: text
  });
  return response.embedding;
}


/**
*
* @param
*
* @return
*/
async function CheckSimalirity(query, sess) {
  try{
    const client = new QdrantClient({url: 'http://127.0.0.1:6333'});
    const queryEmbedding = await generateEmbedding(query);
    console.log(`qvec.len=`, queryEmbedding.length);
    let targetEmbed = null;
    if(queryEmbedding.length === 0) {
      throw new Error("error, queryEmbedding none");
    }
    const result = await client.search(COLLECT_NAME, {
      vector: queryEmbedding,
      limit: 1,
    });
    let matches = "";
    let ouStr = "";
    result.forEach((doc, i) => {
      let content = doc.payload.content
      //console.log(`\n${i + 1}. ${doc.payload.content}`);
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
export async function Chat(userQuery, sess) {
  const apiKey= process.env.GOOGLE_API_KEY;
  const query = await CheckSimalirity(userQuery, sess);

  const newQuery = `
***
日本語で、回答して欲しい。
${query}
`;
  let outStr = ""

  try{
    console.log("formatted query: ", newQuery)

    const client = new CopilotClient();
    const session = await client.createSession({ model: "gpt-4.1" });

    const response = await session.sendAndWait({ prompt: newQuery });
    await client.stop();
    console.log(response?.data.content);
    const out = response?.data.content
    return out
  }catch(e){
    console.log(e)
    return outStr
  }
}