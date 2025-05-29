import { NextResponse } from 'next/server';
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { generateText } from 'ai';
import { z } from 'zod';

import { getNumber } from '../../tools/getNumber';
import { getSheetTest } from '../../tools/getSheetTest';

const MODEL_NAME = "gemini-2.0-flash";

export async function POST(req: Request) {
  const { messages } = await req.json();
  //console.log("msg=", messages);
  const result = await generateText({
    model: google(MODEL_NAME),
    tools: {
      getNumber , getSheetTest , 
    },
    maxSteps: 5,
    messages: [{ role: "user", content: messages }],
  });
  console.log("artifact:");
  console.log(result.text);
  return NextResponse.json({ret: 200, text: result.text});
}
