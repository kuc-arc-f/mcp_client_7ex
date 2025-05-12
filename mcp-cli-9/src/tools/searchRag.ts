import ollama from 'ollama'
import { generateText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { createInterface } from "node:readline/promises";
import Database from 'better-sqlite3';

const db = new Database('embedblob.db');
const MODEL_NAME = "gemini-2.0-flash";

async function EmbedUserQuery(query) {
    const res = await ollama.embed({
        model: "mxbai-embed-large",
        truncate: true,
        input: query,
        // truncate: true
    })
   const f = new Float32Array(res.embeddings.flat())
    return  f
}

function computeL2Norm(vector) {
    let sumSq = 0;
    for (let i = 0; i < vector.length; i++) {
        const val = vector[i];
        sumSq += val * val;
    }
    return Math.sqrt(sumSq);
}


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

async function CheckSimalirity(query, sess) {
    const rows = db.prepare(`
          SELECT * FROM embeddings WHERE sessid = ?
        `).all(sess)

    let matches = ``
    if (rows.length > 0) {
        const embedding = await EmbedUserQuery(query)
        for (const row of rows) {
            const e = new Float32Array(row.embeddings.buffer)
            const sim = cosineSimilarity(embedding, e)
            //console.log(`doc: ${row.name}, similarity: ${sim}, user query: ${query}`)
            if (sim > 0.6) {
                matches += row.content + "\n"
            }
        }
    }

    return matches !== `` ? `
     context: ${matches}\n
     user query: ${query}
    ` : query

}

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