import { NextResponse } from 'next/server';
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { generateText } from 'ai';
import { z } from 'zod';

import { Chat } from '../../tools/searchRag';

const MODEL_NAME = "gemini-2.0-flash";

export async function POST(req: Request) {
  const { messages } = await req.json();
  //console.log("msg=", messages);
  const result = await Chat(messages, "sess1")
  return NextResponse.json({ret: 200, text: result});
}
