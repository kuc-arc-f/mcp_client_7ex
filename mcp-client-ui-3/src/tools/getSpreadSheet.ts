import { generateText, tool } from "ai";
import { z } from "zod";

export const getSpreadSheet = tool({
  description: "スプレッドシートのTODOリスト、markdown記法の表形式で表示します。",
  parameters: z.object({}),
  execute: async () => {
    const sheetId = import.meta.env.VITE_SPREADSHEET_ID;
    const apiKey = import.meta.env.VITE_GOOGLE_AUTH_API_KEY;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/シート1!A1:B100?key=${apiKey}`;
    const response = await fetch(url); 
    if(response.ok === false){
      throw new Error("Error, response <> OK:");
    }
    const json = await response.json();
    let rowMd = "";
    json.values.forEach((row, idx) => {
      if(idx > 0) {
        let target = "| " + row + "| " + "\n";
        rowMd += target;
      }
    });
    let text = `| TODO  |
|------|
${rowMd}
`;
    console.log(text);
    return text;
  },
});
