import { generateText, tool } from 'ai';
import { z } from 'zod';

const VITE_API_KEY =import.meta.env.VITE_API_KEY
const VITE_MCP_URL =import.meta.env.VITE_MCP_URL

export const addItemPrice = tool({
  description: "品名と価格を受け取り, をAPIに 送信して欲しい。",
  parameters: z.object({
    name: z.string().min(1, { message: 'タイトルは必須です' }),
    price: z.number().describe("数値")
  }),
  execute: async ({ name, price }) => {
    try{
        const item = {
          "jsonrpc": "2.0",
          "method": "tools/call",
          "params": {
            "name": "purchase_add",
            "arguments": {
              "name": name , "price": price
            }
          },
          "id": 3
        }
        const response = await fetch(VITE_MCP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': VITE_API_KEY,
        },
        body: JSON.stringify(item),
      });
      let out = "";
      if (!response.ok) {
        const text = await response.text();
        console.log(text);
        throw new Error('Failed to create item');
      }else{
        const json = await response.json();
        console.log(json);
        console.log(json.result.content[0].text);
        out = json.result.content[0].text;
      }
      return "result : " + out;    
    }catch(e){
      console.log(e);
      return "result : error server";    

    }    
  },
});

