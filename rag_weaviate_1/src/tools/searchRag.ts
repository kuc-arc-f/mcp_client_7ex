
import weaviate from "weaviate-client";
import 'dotenv/config'

// コレクション名
const COLLECT_NAME = "document"
/**
*
* @param
*
* @return
*/
async function EmbedUserQuery(query) {
  const apiKey= process.env.GOOGLE_API_KEY;
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
      console.log("OK");
      const json = await response.json();
      //console.log(json.embedding.values);
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
async function CheckSimalirity(query, sess) {
  try{
    const client = await weaviate.connectToLocal({
      host: "localhost",
      port: 8080,
    });
    const articles = client.collections.get(COLLECT_NAME);

    const queryEmbedding = await EmbedUserQuery(query);
    console.log(`qvec.len=`, queryEmbedding.length);
    let targetEmbed = null;
    if(queryEmbedding.length === 0) {
      throw new Error("error, queryEmbedding none");
    }

    const result = await articles.query.nearVector(queryEmbedding, {
      limit: 2,
      returnMetadata: ["distance"],
    });
    let matches = "";
    let ouStr = "";
    result.objects.forEach(obj => {
      //console.log({
      //  content: obj.properties.content,
      //  distance: obj.metadata.distance,
      //});
      console.log("distance=", obj.metadata.distance);
      let content = obj.properties.content;
      ouStr += content + "\n\n";
    });
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
    const item = {
      "contents": [{
        "parts":[{"text": newQuery}]
      }]
    }
    console.log("url="+ url)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const text = await response.text();
      console.log(text);
      throw new Error('Failed to create item');
    }else{
      console.log("OK");
      const json = await response.json();
      //console.log(json.candidates[0].content.parts[0].text);
      outStr = json.candidates[0].content.parts[0].text
    }    

    return outStr
  }catch(e){
    console.log(e)
    return outStr
  }
}