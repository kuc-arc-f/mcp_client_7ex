
import { addItemPrice } from "./tools/addItemPrice";

import { generateText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import 'dotenv/config';
import { createInterface } from "node:readline/promises";

const MODEL_NAME = "gemini-2.5-flash";

async function executeMcp(input: string) {
  const result = await generateText({
    model: google(MODEL_NAME),
    tools: {
      addItemPrice
    },
    maxSteps: 5,
    messages: [{ role: "user", content: input }],
  });
  console.log("artifact:");
  console.log(result.text);
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  while (true) {
    const input = await rl.question("input:");
    if (input === "exit") {
      break;
    }
    console.log("input=", input);
    executeMcp(input);
    break;

    rl.write("\n");
  }
}
main().catch((err) => {
    console.error("Error:", err);
})
.finally(() => {
  rl.close();
});
