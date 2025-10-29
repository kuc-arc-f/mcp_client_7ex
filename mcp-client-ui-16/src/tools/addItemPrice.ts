import { generateText, tool } from 'ai';
import { z } from 'zod';
import RpcClient from '../lib/RpcClient'

const CMD_PATH = "/work/rust/extra/mcp_4/target/release/rust_mcp_server_4.exe"

export const addItemPrice = tool({
  description: "品名と価格を受け取り, をAPIに 送信して欲しい。",
  parameters: z.object({
    name: z.string().min(1, { message: 'タイトルは必須です' }),
    price: z.number().describe("数値")
  }),
  execute: async ({ name, price }) => {
    const client = new RpcClient(CMD_PATH);

    const resp = await client.call(
      "tools/call", 
      { 
        name: "purchase", 
        arguments: {name: name, price: price}, 
      },
    );
    client.close();
    const out = `<a href="/data/output.xlsx">[ Download Excel ]</a>`
    //return "result : " + resp;    
    return "result : " + out;    
  },
});

