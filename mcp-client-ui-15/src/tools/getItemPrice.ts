import { generateText, tool } from 'ai';
import { z } from 'zod';

const VITE_API_KEY =import.meta.env.VITE_API_KEY
const VITE_MCP_URL =import.meta.env.VITE_MCP_URL

export const getItemPrice = tool({
  description: '購入品リストを、表示します。',
  parameters: z.object({
  }),
  execute: async () => {
    try{
        const item = {
          "jsonrpc": "2.0",
          "method": "tools/call",
          "params": {
            "name": "purchase_list",
            "arguments": null,
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
      let out = null;
      if (!response.ok) {
        const text = await response.text();
        console.log(text);
        throw new Error('Failed to create item');
      }else{
        const json = await response.json();
        console.log(json);
        console.log(json.result.content[0].text);
        //out = json.result.content[0].text;
        out = json.result.content[0];
      }
      //return "result : " + out;    
      return out;    
    }catch(e){
      console.log(e);
      return "result : error server";    

    }    
  },
});

